import { ChartDataEntity, CompositeGraphicsComponent, dummyGlProgramSpecification, IChartComponent, TGlContext, TGlEntityRenderer, TGlInstancedEntityRenderer } from "@visualization-tools/core";
import { ICartesian2dPlotConstructionOptions } from "./options/cartesian2d-plot-construction-options";
import { Cartesian2dPlotCtorArg } from "./cartesian2d-plot-ctor-arg";
import { ICartesian2dPlotCtor } from "./i-cartesian2d-plot-ctor";
import { GlCartesian2dTraceBinder, TGlTraceEntity } from "../axis/traces/gl-cartesian-2d-trace-binder";
import { Cartesian2dTraceEntityConnector } from "../axis/cartesian-2d-trace-entity-connector";
import { createCartesianPlotCtor } from "./create-cartesian-plot-ctor";
import { GlCartesian2dCameraBinder } from "../camera/gl-cartesian2d-camera-binder";
import { GlCartesian2dTraceGraphicsComponent } from "../axis/traces/gl-cartesian-2d-trace-graphics-component";
import { populateCartesian2dTraceBindings } from "../axis/populate-cartesian-2d-trace-bindings";
import { GlCartesian2dAxisGraphicsComponent } from "../axis/labels/gl-cartesian-2d-axis-graphics-component";
import { GlCartesianUpdateHooks } from "../update/gl-cartesian-update-hooks";
import { ICartesian2dUpdateArg } from "../update/cartesian2d-update-arg";
import { ICartesian2dPlot } from "./i-cartesian2d-plot";
import { T2dZIndexesTrait } from "../traits/t2d-z-indexes-trait";

/**
 * @public
 * Creates a Cartesian 2d plot.
 */
export class GlCartesian2dPlotFactory
{
    public static createOne<TEntityRenderer extends TGlEntityRenderer<TGlContext, never>, TRequiredTraits>
    (
        chart: IChartComponent<TEntityRenderer>,
        options: ICartesian2dPlotConstructionOptions<Float32Array, TRequiredTraits>,
    )
        : TGlCartesianPlot<TEntityRenderer, TRequiredTraits>
    {
        const plotArea = options.getPlotArea(chart.attachPoint);
        const arg = new Cartesian2dPlotCtorArg<Float32Array, TRequiredTraits>(chart, options, plotArea);

        return new (GlCartesianPlot as TGlCartesianPlotCtor<TEntityRenderer, TRequiredTraits>)(arg);
    }

    public static setDefaultAxis
    (
        plot: ICartesian2dPlot<TGlInstancedEntityRenderer, Float32Array, T2dZIndexesTrait>,
        options: ICartesian2dPlotConstructionOptions<Float32Array, T2dZIndexesTrait>,
    )
        : void
    {
        const traceBinderTrace = new GlCartesian2dTraceBinder();
        const traceBinderAxis = new GlCartesian2dTraceBinder();
        traceBinderTrace.mergeBuffers([traceBinderAxis]);
        const traceConnector = new Cartesian2dTraceEntityConnector(Float32Array, options.traceOptions.maxTraceCount, plot.changeIdFactory);

        const axisComponents = CompositeGraphicsComponent
            .createOne(dummyGlProgramSpecification, new GlCartesian2dTraceGraphicsComponent(traceBinderTrace, new GlCartesian2dCameraBinder()))
            .addComponent(new GlCartesian2dAxisGraphicsComponent(plot.attachPoint, traceBinderAxis, new GlCartesian2dCameraBinder()));

        plot.metaCategory.addEntity(
            new ChartDataEntity(
                traceConnector,
                {
                    traceColor: options.traceOptions.traceColor,
                    traceLinePixelSize: options.traceOptions.traceLinePixelSize,
                    zIndexAbs: 0,
                    zIndexRel: 0,
                    axisOptions: options.axisConfig,
                    traces: new Float32Array(2 * 4 * (options.traceOptions.maxTraceCount + 3)),
                },
                plot.changeIdFactory,
                function
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
export type TGlCartesianPlot<TEntityRenderer extends TGlEntityRenderer<TGlContext, never>, TRequiredTraits> =
    ICartesian2dPlot<TEntityRenderer, Float32Array, TRequiredTraits>
    ;

type TGlCartesianPlotCtor<TEntityRenderer extends TGlEntityRenderer<TGlContext, never>, TRequiredTraits> =
    ICartesian2dPlotCtor<TEntityRenderer, Float32Array, TRequiredTraits>
    ;

const GlCartesianPlot = createCartesianPlotCtor(
    GlCartesian2dPlotFactory,
    new GlCartesianUpdateHooks(arg => arg.plotDimensionsOBL.pixelArea.wholeRange),
    new GlCartesianUpdateHooks(arg => arg.plotDimensionsOBL.pixelArea.interactiveRange),
);