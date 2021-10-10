import { ChartDataEntity, CompositeGraphicsComponent, IChartComponent, IGlRenderer, TGlComponentRenderer, TGlContext, TGlInstancedComponentRenderer } from "@visualization-tools/core";
import { ICartesian2dPlotConstructionOptions } from "./options/cartesian2d-plot-construction-options";
import { Cartesian2dPlotCtorArg } from "./cartesian2d-plot-ctor-arg";
import { ICartesian2dPlotCtor } from "./i-cartesian2d-plot-ctor";
import { GlCartesian2dTraceBinder } from "../axis/traces/gl-cartesian-2d-trace-binder";
import { Cartesian2dTraceEntityConnector } from "../axis/cartesian-2d-trace-entity-connector";
import { createCartesianPlotCtor } from "./create-cartesian-plot-ctor";
import { GlCartesian2dCameraBinder } from "../camera/gl-cartesian2d-camera-binder";
import { GlCartesian2dTraceGraphicsComponent } from "../axis/traces/gl-cartesian-2d-trace-graphics-component";
import { populateCartesian2dTraceBindings } from "../axis/populate-cartesian-2d-trace-bindings";
import { GlCartesian2dAxisGraphicsComponent } from "../axis/labels/gl-cartesian-2d-axis-graphics-component";
import { GlCartesianUpdateHooks } from "../update/update-arg/gl-cartesian-update-hooks";
import { ICartesian2dUpdateArg } from "../update/update-arg/cartesian2d-update-arg";
import { ICartesian2dPlot } from "./i-cartesian2d-plot";
import { T2dZIndexesTrait } from "../traits/t2d-z-indexes-trait";
import { TGlTraceEntity } from "../axis/traces/t-gl-trace-entity";

/**
 * @public
 * Creates a Cartesian 2d plot.
 */
export class GlCartesian2dPlotFactory
{
    public static createOne<TComponentRenderer extends TGlComponentRenderer<TGlContext, never>, TRequiredTraits>
    (
        chart: IChartComponent<IGlRenderer<TComponentRenderer>>,
        options: ICartesian2dPlotConstructionOptions<Float32Array, TRequiredTraits>,
    )
        : TGlCartesianPlot<TComponentRenderer, TRequiredTraits>
    {
        const plotArea = options.getPlotArea(chart.attachPoint);
        const arg = new Cartesian2dPlotCtorArg<Float32Array, TRequiredTraits>(chart, options, plotArea);

        return new (GlCartesianPlot as TGlCartesianPlotCtor<TComponentRenderer, TRequiredTraits>)(arg);
    }

    public static setDefaultAxis
    (
        plot: ICartesian2dPlot<TGlInstancedComponentRenderer, Float32Array, T2dZIndexesTrait>,
        options: ICartesian2dPlotConstructionOptions<Float32Array, T2dZIndexesTrait>,
    )
        : void
    {
        const axisComponents = CompositeGraphicsComponent
            .createOneLinked(new GlCartesian2dTraceGraphicsComponent(new GlCartesian2dTraceBinder(), new GlCartesian2dCameraBinder()))
            .addComponent(new GlCartesian2dAxisGraphicsComponent(plot.attachPoint, new GlCartesian2dTraceBinder(), new GlCartesian2dCameraBinder()))
            .build();

        plot.metaCategory.addEntity(
            new ChartDataEntity(
                new Cartesian2dTraceEntityConnector(Float32Array, options.traceOptions.maxTraceCount, plot.changeIdFactory),
                {
                    traceColor: options.traceOptions.traceColor,
                    traceLinePixelSize: options.traceOptions.traceLinePixelSize,
                    zIndexAbs: 0,
                    zIndexRel: 0,
                    axisOptions: options.axisConfig,
                    traces: new Float32Array(2 * 4 * (options.traceOptions.maxTraceCount + 3)),
                },
                plot.changeIdFactory,
                function onBeforeUpdate
                (
                    this: TGlTraceEntity,
                    arg: ICartesian2dUpdateArg<Float32Array>,
                )
                    : void
                {
                    this.changeId = this.data.update(arg.plotRange);
                    populateCartesian2dTraceBindings(this);
                },
            ),
            axisComponents,
        );
    }
}

/**
 * @public
 */
export type TGlCartesianPlot<TComponentRenderer extends TGlComponentRenderer<TGlContext, never>, TRequiredTraits> =
    ICartesian2dPlot<TComponentRenderer, Float32Array, TRequiredTraits>
    ;

type TGlCartesianPlotCtor<TComponentRenderer extends TGlComponentRenderer<TGlContext, never>, TRequiredTraits> =
    ICartesian2dPlotCtor<TComponentRenderer, Float32Array, TRequiredTraits>
    ;

const GlCartesianPlot = createCartesianPlotCtor(
    GlCartesian2dPlotFactory,
    new GlCartesianUpdateHooks(arg => arg.plotDimensionsOBL.pixelArea.wholeRange),
    new GlCartesianUpdateHooks(arg => arg.plotDimensionsOBL.pixelArea.interactiveRange),
);