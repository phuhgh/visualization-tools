import { CanvasCartesianUpdateHooks } from "../update/update-arg/canvas-cartesian-update-hooks";
import { ICartesian2dPlotConstructionOptions } from "./options/cartesian2d-plot-construction-options";
import { Cartesian2dPlotCtorArg } from "./cartesian2d-plot-ctor-arg";
import { ICartesian2dPlotCtor } from "./i-cartesian2d-plot-ctor";
import { Cartesian2dTraceEntityConnector } from "../axis/cartesian-2d-trace-entity-connector";
import { createCartesianPlotCtor } from "./create-cartesian-plot-ctor";
import { CanvasCartesian2dAxisLabelGraphicsComponent } from "../axis/labels/canvas-cartesian-2d-axis-label-graphics-component";
import { CanvasCartesian2dTraceGraphicsComponent } from "../axis/traces/canvas-cartesian-2d-trace-graphics-component";
import { TTraceEntity } from "../axis/traces/t-trace-entity";
import { ICartesian2dUpdateArg } from "../update/update-arg/cartesian2d-update-arg";
import { ICartesian2dPlot } from "./i-cartesian2d-plot";
import { T2dZIndexesTrait } from "../traits/t2d-z-indexes-trait";
import { ChartDataEntity, CompositeGraphicsComponent, ICanvasComponentRenderer, ICanvasRenderer, IChartComponent } from "@visualization-tools/core";

/**
 * @public
 * Provides {@link TCanvasCartesianPlot} for canvas charts.
 */
export class CanvasCartesian2dPlotFactory
{
    public static createOne<TRequiredTraits>
    (
        chart: IChartComponent<ICanvasRenderer>,
        options: ICartesian2dPlotConstructionOptions<Float64Array, TRequiredTraits>,
    )
        : TCanvasCartesianPlot<TRequiredTraits>
    {
        const plotArea = options.getPlotArea(chart.attachPoint);
        const arg = new Cartesian2dPlotCtorArg<Float64Array, TRequiredTraits>(chart, options, plotArea);

        return new (CanvasCartesianPlot as TCanvasCartesianPlotCtor<TRequiredTraits>)(arg);
    }

    public static setDefaultAxis
    (
        plot: ICartesian2dPlot<ICanvasComponentRenderer, Float64Array, T2dZIndexesTrait>,
        options: ICartesian2dPlotConstructionOptions<Float64Array, T2dZIndexesTrait>,
        chart: IChartComponent<ICanvasRenderer>,
    )
        : void
    {
        const traceConnector = new Cartesian2dTraceEntityConnector(Float64Array, options.traceOptions.maxTraceCount, plot.changeIdFactory);
        const axisGraphicsComponents = CompositeGraphicsComponent
            .createOne(new CanvasCartesian2dTraceGraphicsComponent())
            .addComponent(new CanvasCartesian2dAxisLabelGraphicsComponent(chart.attachPoint))
            .build();

        plot.metaCategory.addEntity(
            new ChartDataEntity(
                traceConnector,
                {
                    traceColor: options.traceOptions.traceColor,
                    traceLinePixelSize: options.traceOptions.traceLinePixelSize,
                    axisOptions: options.axisConfig,
                    zIndexRel: 0,
                    zIndexAbs: 0,
                },
                plot.changeIdFactory,
                function
                (
                    this: TTraceEntity<Float64Array>,
                    arg: ICartesian2dUpdateArg<Float64Array>,
                )
                    : void
                {
                    this.changeId = this.data.update(arg.plotRange);
                },
            ),
            axisGraphicsComponents,
        );
    }
}

/**
 * @public
 * Canvas {@link ICartesian2dPlot}.
 */
export type TCanvasCartesianPlot<TRequiredTraits> =
    ICartesian2dPlot<ICanvasComponentRenderer, Float64Array, TRequiredTraits>
    ;

export type TCanvasCartesianPlotCtor<TRequiredTraits> =
    ICartesian2dPlotCtor<ICanvasComponentRenderer, Float64Array, TRequiredTraits>
    ;


const CanvasCartesianPlot = createCartesianPlotCtor(
    CanvasCartesian2dPlotFactory,
    new CanvasCartesianUpdateHooks(arg => arg.plotDimensionsOTL.pixelArea.wholeRange),
    new CanvasCartesianUpdateHooks(arg => arg.plotDimensionsOTL.pixelArea.interactiveRange),
);
