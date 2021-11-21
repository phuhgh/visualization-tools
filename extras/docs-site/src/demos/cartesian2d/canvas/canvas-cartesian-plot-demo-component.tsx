import React, { useEffect, useRef, useState } from "react";
import { Cartesian2dDemoComponent } from "../cartesian2d-demo-component";
import { _Array, _Production, BroadcastEvent, IEmscriptenWrapper, Range1d, Range2d, TF64Range2d } from "rc-js-util";
import { IDemoOptions, TDemoCommandChannel } from "../../i-demo-props";
import { TPointEntity } from "../t-point-entity";
import { TDemoEvents } from "../../events/t-demo-events";
import { ICartesianPlotOptions } from "../../../cartesian2d-plot/i-cartesian-plot-options";
import { PointEntityCollection } from "../point-entity-collection";
import { IPlotCommandHandlers } from "../../../cartesian2d-plot/commands/plot-command-adapter";
import { configureEntityInteractionHandlers } from "../configure-entity-interaction-handlers";
import { EDemoEvent } from "../../events/e-demo-event";
import { TPlotCommands } from "../../../cartesian2d-plot/commands/t-plot-commands";
import { EPlotCommand } from "../../../cartesian2d-plot/commands/e-plot-command";
import { UpdateOnNextFrameCommand } from "../../../chart/commands/update-on-next-frame-command";
import { getTestPlotOptions } from "@visualization-tools/test-data";
import { addEntityToCategory, CanvasChartFactory, ChartConfig, ICanvasComponentRenderer, ICanvasRenderer, IChartComponent, NoOpHitTestComponent } from "@visualization-tools/core";
import { CanvasCartesian2dPlotFactory, CanvasCartesian2dUpdateArgProvider, CanvasLineGraphicsComponent, Cartesian2dNaturalLogTransform, Cartesian2dPlotRange, Cartesian2dPlotSharedQuadTree, ICartesian2dBindings, ICartesian2dPlot, ICartesian2dPlotRange, Point2dSubcategory } from "@visualization-tools/cartesian-2d";
import { generateCanvasDemoEntities } from "./generate-canvas-demo-entities";
import { ICanvasChartComponentOptions } from "../../../chart/i-canvas-chart-component-options";

export interface ICartesianDemoArgs<TTraits>
{
    emscriptenModule: IEmscriptenWrapper<ICartesian2dBindings>;
    demoCommandChannel: TDemoCommandChannel;
    onDemoEvent: ($event: TDemoEvents<TTraits>) => void;
}

export function CanvasCartesianPlotDemoComponent
(
    props: ICartesianDemoArgs<TPointEntity<Float64ArrayConstructor>>,
)
    : React.ReactElement
{
    const [chartComponentOptions] = useState(() => createGlChart());
    const [demoOptions] = useState<IDemoOptions<TPointEntity<Float64ArrayConstructor>>>(() => ({
        commandChannel: props.demoCommandChannel,
        title: "Canvas2d - 6k points",
        subtitle: "Size and color per point, variable width line, segment highlighting across a random grouping. Log scaling calculated on draw",
    }));
    const initialRange = Range2d.f64.factory.createOne(1, 10, 1, 10);
    const initialTransform: [boolean, boolean] = [false, true];
    const { entityCollection, plotComponentOptions, updatePlot } = usePlot(initialRange, initialTransform, props.emscriptenModule);
    const [selectedEntities, setSelectedEntities] = useState<ReadonlySet<TPointEntity<Float64ArrayConstructor>>>(() => new Set([]));

    useEffect(() =>
    {
        const changeIdFactory = chartComponentOptions.constructionOptions.chartConfig.changeIdFactory;
        entityCollection.current = generateCanvasDemoEntities(initialRange, props.emscriptenModule, changeIdFactory);
        setSelectedEntities(new Set(entityCollection.current.entities));
    }, []);

    function onPlotCommand($event: TPlotCommands<ICartesian2dPlotRange<Float64Array>, TPointEntity<Float64ArrayConstructor>>): void
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

    function onDemoEvent($event: TDemoEvents<TPointEntity<Float64ArrayConstructor>>): void
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
                                  storageType={Float64Array}
                                  emscriptenModule={props.emscriptenModule}
                                  chartOptions={chartComponentOptions}
                                  demoOptions={demoOptions}
                                  plotOptions={plotComponentOptions}
                                  entityOptions={{ entities: entityCollection.current.entities, selectedEntities: selectedEntities }}/>
    );
}

type TPlotOptions = ICartesianPlotOptions<ICanvasRenderer, Float64ArrayConstructor, TPointEntity<Float64ArrayConstructor>>;
type TEntityCollection = PointEntityCollection<Float64ArrayConstructor, TPointEntity<Float64ArrayConstructor>>;
type TGlCartesianPlot = ICartesian2dPlot<ICanvasComponentRenderer, Float64Array, TPointEntity<Float64ArrayConstructor>>;

function usePlot
(
    initialRange: Range2d<Float64Array>,
    initialTransform: [boolean, boolean],
    emscriptenModule: IEmscriptenWrapper<ICartesian2dBindings>,
)
{
    const entityCollection = useRef<TEntityCollection>(new PointEntityCollection([], new Point2dSubcategory(new Range1d.f64()), new NoOpHitTestComponent()));
    const [plotComponentOptions, setPlotOptions] = useState((): TPlotOptions => createGlPlot({
        commandHandler: getPlotCommandHandler({
            initialTransform: initialTransform,
            initialRange: initialRange,
        }),
        initialTransform: initialTransform,
        initialRange: initialRange,
        onPlotCreated: (plot, chart) =>
        {
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

function createGlChart(): ICanvasChartComponentOptions
{
    return {
        constructionOptions: {
            chartConfig: new ChartConfig(),
        },
        chartFactory: CanvasChartFactory,
        commandChannel: new BroadcastEvent("onChartCommand"),
    };
}

function createGlPlot
(
    options: {
        initialRange: TF64Range2d,
        initialTransform: [boolean, boolean],
        commandHandler: IPlotCommandHandlers<ICartesian2dPlotRange<Float64Array>, TPointEntity<Float64ArrayConstructor>>,
        onPlotCreated: (plot: TGlCartesianPlot, chart: IChartComponent<ICanvasRenderer>) => void,
    },
)
    : TPlotOptions
{
    const initialRange = options.initialRange;
    const initialTransform = options.initialTransform;

    return {
        plotFactory: CanvasCartesian2dPlotFactory,
        options: getTestPlotOptions<Float64Array, TPointEntity<Float64ArrayConstructor>>({
            plotName: "canvas plot",
            plotRange: Cartesian2dPlotRange.createOneF64({
                userTransform: new Cartesian2dNaturalLogTransform(initialTransform[0], initialTransform[1]),
                maxZoom: 100,
                dataRange: initialRange.slice(),
                maxBounds: Range2d.f64.factory.createOne(1, 20, 1, 20),
            }),
            plotPosition: Range2d.f32.factory.createOne(-1, 1, -1, 1),
            updateArgProvider: new CanvasCartesian2dUpdateArgProvider(),
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
        initialRange: TF64Range2d,
        initialTransform: [boolean, boolean],
    },
)
    : IPlotCommandHandlers<ICartesian2dPlotRange<Float64Array>, TPointEntity<Float64ArrayConstructor>>
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
    entities: readonly TPointEntity<Float64ArrayConstructor>[],
    pointSubcategory: Point2dSubcategory<Float64Array>,
)
{
    const lineGc = new CanvasLineGraphicsComponent();

    _Array.forEach(entities, entity => addEntityToCategory(plot.dataCategory, entity, lineGc, pointSubcategory));
}