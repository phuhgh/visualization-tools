import React, { useEffect, useRef, useState } from "react";
import { Cartesian2dDemoComponent } from "../cartesian2d-demo-component";
import { _Array, _Production, BroadcastEvent, IEmscriptenWrapper, Range1d, Range2d, TF32Range2d } from "rc-js-util";
import { IGlChartComponentOptions } from "../../../chart/i-gl-chart-component-options";
import { IDemoOptions, TDemoCommandChannel } from "../../i-demo-props";
import { TPointEntity } from "../t-point-entity";
import { TDemoEvents } from "../../events/t-demo-events";
import { ICartesianPlotOptions } from "../../../cartesian2d-plot/i-cartesian-plot-options";
import { generateGlDemoEntities } from "./generate-gl-demo-entities";
import { PointEntityCollection } from "../point-entity-collection";
import { IPlotCommandHandlers } from "../../../cartesian2d-plot/commands/plot-command-adapter";
import { configureEntityInteractionHandlers } from "../configure-entity-interaction-handlers";
import { EDemoEvent } from "../../events/e-demo-event";
import { TPlotCommands } from "../../../cartesian2d-plot/commands/t-plot-commands";
import { EPlotCommand } from "../../../cartesian2d-plot/commands/e-plot-command";
import { UpdateOnNextFrameCommand } from "../../../chart/commands/update-on-next-frame-command";
import { addEntityToCategory, ChartConfig, CompositeGraphicsComponent, Gl2ContextAdapter, GlChartFactory, GlRendererOptions, IChartComponent, IGlRenderer, NoOpHitTestComponent, SharedInterleavedConnector, TGl2ComponentRenderer } from "@visualization-tools/core";
import { Cartesian2dNaturalLogTransform, Cartesian2dPlotRange, Cartesian2dPlotSharedQuadTree, GlCaplessLineGraphicsComponent, GlCartesian2dCameraBinder, GlCartesian2dPlotFactory, GlCartesian2dUpdateArgProvider, GlInterleaved2dPointBinder, GlLineFlatCapGraphicsComponent, GlPoint2dNaturalLogTransformComponent, GlTrace2dNaturalLogTransformComponent, ICartesian2dBindings, ICartesian2dPlot, ICartesian2dPlotRange, Point2dSubcategory } from "@visualization-tools/cartesian-2d";
import { getTestPlotOptions } from "@visualization-tools/test-data";

export interface ICartesianDemoArgs<TTraits>
{
    emscriptenModule: IEmscriptenWrapper<ICartesian2dBindings>;
    demoCommandChannel: TDemoCommandChannel;
    onDemoEvent: ($event: TDemoEvents<TTraits>) => void;
}

export function GlCartesianPlotDemoComponent
(
    props: ICartesianDemoArgs<TPointEntity<Float32ArrayConstructor>>,
)
    : React.ReactElement
{
    const [chartComponentOptions] = useState(() => createGlChart());
    const [demoOptions] = useState<IDemoOptions<TPointEntity<Float32ArrayConstructor>>>(() => ({
        commandChannel: props.demoCommandChannel,
        title: "WebGL2 - 400k points",
        subtitle: "Size and color per point, variable width line, segment highlighting across a random grouping. Log scaling provided by transform feedback.",
    }));
    const initialRange = Range2d.f32.factory.createOne(1, 10, 1, 10);
    const initialTransform: [boolean, boolean] = [false, true];
    const { entityCollection, plotComponentOptions, updatePlot } = usePlot(initialRange, initialTransform, props.emscriptenModule);
    const [selectedEntities, setSelectedEntities] = useState<ReadonlySet<TPointEntity<Float32ArrayConstructor>>>(() => new Set([]));

    useEffect(() =>
    {
        const changeIdFactory = chartComponentOptions.constructionOptions.chartConfig.changeIdFactory;
        entityCollection.current = generateGlDemoEntities(initialRange, props.emscriptenModule, changeIdFactory);
        setSelectedEntities(new Set(entityCollection.current.entities));
    }, []);

    function onPlotCommand($event: TPlotCommands<ICartesian2dPlotRange<Float32Array>, TPointEntity<Float32ArrayConstructor>>): void
    {
        switch ($event.id)
        {
            case EPlotCommand.SetAxis:
                updatePlot();
                break;
            case EPlotCommand.AddEntity:
                // no action required
                break;
            default:
                _Production.assertValueIsNever($event);
                break;
        }
    }

    function onDemoEvent($event: TDemoEvents<TPointEntity<Float32ArrayConstructor>>): void
    {
        props.onDemoEvent($event);

        switch ($event.id)
        {
            case EDemoEvent.EntitySelectionChanged:
            {
                setSelectedEntities($event.arg.newSelection);
                chartComponentOptions.commandChannel.emit(new UpdateOnNextFrameCommand({}));
                break;
            }
            case EDemoEvent.ResetDemo:
                _Array.forEach(entityCollection.current.entities, (entity) => entity.isFiltered = false);
                setSelectedEntities(new Set(entityCollection.current.entities));
                break;
            case EDemoEvent.ProxyPlotCommand:
                onPlotCommand($event.arg);
                break;
            case EDemoEvent.MaximizeDemo:
            case EDemoEvent.MinimizeDemo:
                // no action required
                break;
            default:
                _Production.assertValueIsNever($event);
                break;
        }
    }

    return (
        <Cartesian2dDemoComponent onDemoEvent={onDemoEvent}
                                  storageType={Float32Array}
                                  emscriptenModule={props.emscriptenModule}
                                  chartOptions={chartComponentOptions}
                                  demoOptions={demoOptions}
                                  plotOptions={plotComponentOptions}
                                  entityOptions={{ entities: entityCollection.current.entities, selectedEntities: selectedEntities }}/>
    );
}

type TPlotOptions = ICartesianPlotOptions<IGlRenderer<TGl2ComponentRenderer>, Float32ArrayConstructor, TPointEntity<Float32ArrayConstructor>>;
type TEntityCollection = PointEntityCollection<Float32ArrayConstructor, TPointEntity<Float32ArrayConstructor>>;
type TGlCartesianPlot = ICartesian2dPlot<TGl2ComponentRenderer, Float32Array, TPointEntity<Float32ArrayConstructor>>;

function usePlot
(
    initialRange: Range2d<Float32Array>,
    initialTransform: [boolean, boolean],
    emscriptenModule: IEmscriptenWrapper<ICartesian2dBindings>,
)
{
    const entityCollection = useRef<TEntityCollection>(new PointEntityCollection([], new Point2dSubcategory(new Range1d.f32()), new NoOpHitTestComponent()));
    const [plotComponentOptions, setPlotOptions] = useState((): TPlotOptions => createGlPlot({
        commandHandler: getPlotCommandHandler({
            initialTransform: initialTransform,
            initialRange: initialRange,
        }),
        initialTransform: initialTransform,
        initialRange: initialRange,
        onPlotCreated: (plot, chart) =>
        {
            plot.dataCategory.setBufferPerEntity(true);
            const plotInteractionHandler = new Cartesian2dPlotSharedQuadTree(plot, { yieldTime: 16 });
            plotInteractionHandler.setQuadTreeInteractionHandler(emscriptenModule, chart);

            addEntityToPlot(plot, entityCollection.current.entities, entityCollection.current.pointSubcategory);
            configureEntityInteractionHandlers(plotInteractionHandler, emscriptenModule, entityCollection.current);

            chart.updateOnNextFrame();
        },
    }));
    const updatePlotOptions = (overrides?: Partial<TPlotOptions>) => setPlotOptions({
        ...plotComponentOptions,
        ...overrides,
    });

    return {
        entityCollection: entityCollection,
        plotComponentOptions: plotComponentOptions,
        updatePlot: updatePlotOptions,
    };
}

function createGlChart(): IGlChartComponentOptions
{
    return {
        constructionOptions: {
            chartConfig: new ChartConfig(),
            contextAdapterCtor: Gl2ContextAdapter,
            rendererOptions: new GlRendererOptions([]),
        },
        transforms: {
            transformsToInitialize: [Cartesian2dNaturalLogTransform.transformId],
            setTransforms: (transformFactory) =>
            {
                GlTrace2dNaturalLogTransformComponent.factory.addToChart(transformFactory);
                GlPoint2dNaturalLogTransformComponent.factory.addToChart(transformFactory);
            },
        },
        chartFactory: GlChartFactory,
        commandChannel: new BroadcastEvent("onChartCommand"),
    };
}

function createGlPlot
(
    options: {
        initialRange: TF32Range2d,
        initialTransform: [boolean, boolean],
        commandHandler: IPlotCommandHandlers<ICartesian2dPlotRange<Float32Array>, TPointEntity<Float32ArrayConstructor>>,
        onPlotCreated: (plot: TGlCartesianPlot, chart: IChartComponent<IGlRenderer<TGl2ComponentRenderer>>) => void,
    },
)
    : TPlotOptions
{
    const initialRange = options.initialRange;
    const initialTransform = options.initialTransform;

    return {
        plotFactory: GlCartesian2dPlotFactory,
        options: getTestPlotOptions<Float32Array, TPointEntity<Float32ArrayConstructor>>({
            plotName: "gl plot",
            plotRange: Cartesian2dPlotRange.createOneF32({
                userTransform: new Cartesian2dNaturalLogTransform(initialTransform[0], initialTransform[1]),
                maxZoom: Infinity,
                dataRange: initialRange.slice(),
                maxBounds: Range2d.f32.factory.createOne(1, 100, 1, 100),
            }),
            plotPosition: Range2d.f32.factory.createOne(-1, 1, -1, 1),
            updateArgProvider: new GlCartesian2dUpdateArgProvider(),
        }),
        initialTransform: initialTransform,
        initialRange: initialRange,
        commandChannel: new BroadcastEvent("onPlotCommand"),
        onPlotCreated: options.onPlotCreated,
        commandHandlers: options.commandHandler,
    };
}

function getPlotCommandHandler
(
    options: {
        initialRange: TF32Range2d,
        initialTransform: [boolean, boolean],
    },
)
    : IPlotCommandHandlers<ICartesian2dPlotRange<Float32Array>, TPointEntity<Float32ArrayConstructor>>
{
    return {
        onSetAxis: (plot, arg) =>
        {
            plot.plotRange.userTransform.updateTransform(
                arg.logX ?? plot.plotRange.userTransform.xTransformEnabled,
                arg.logY ?? plot.plotRange.userTransform.yTransformEnabled,
            );
        },
        onResetAxis: (plot) =>
        {
            plot.plotRange.updateDataRange(options.initialRange);
            plot.plotRange.userTransform.updateTransform(options.initialTransform[0], options.initialTransform[1]);
        },
    };
}

function addEntityToPlot
(
    plot: TGlCartesianPlot,
    entities: readonly TPointEntity<Float32ArrayConstructor>[],
    pointSubcategory: Point2dSubcategory<Float32Array>,
)
{
    const interleavedConfig = { offsets: { x: 0, y: 1, size: 2, color: 3 }, blockElementCount: 4 };
    const interleavedBindingDescriptor = SharedInterleavedConnector.getDescriptor(interleavedConfig, Float32Array);
    const lineGc = CompositeGraphicsComponent
        .createOneLinked(new GlCaplessLineGraphicsComponent(new GlCartesian2dCameraBinder(), new GlInterleaved2dPointBinder(interleavedBindingDescriptor, { pointsToBind: 2 })))
        .addComponent(new GlLineFlatCapGraphicsComponent(new GlCartesian2dCameraBinder(), new GlInterleaved2dPointBinder(interleavedBindingDescriptor, { pointsToBind: 3 })))
        .build();

    _Array.forEach(entities, entity => addEntityToCategory(plot.dataCategory, entity, lineGc, pointSubcategory));
}
