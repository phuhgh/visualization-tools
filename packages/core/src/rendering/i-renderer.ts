import { IEntityRendererProvider } from "./i-entity-renderer-provider";
import { IEntityRendererFactory } from "./i-entity-renderer-factory";
import { ICanvasDimensions } from "../templating/canvas-dimensions";
import { IPlotDimensions } from "../plot/plot-dimensions";
import { IGraphicsComponentSpecification } from "./i-graphics-component-specification";
import { IReadonlyPlot } from "../plot/i-plot";
import { TUnknownEntityRenderer } from "./t-unknown-entity-renderer";
import { CompositeGraphicsComponent } from "../entities/components/composite-graphics-component";
import { IRendererSharedState } from "./i-renderer-shared-state";
import { TExtractGcSpec } from "./t-extract-gc-spec";
import { TExtractGcContext } from "./t-extract-gc-context";

/**
 * @public
 */
export type TUnknownRenderer = IRenderer<TUnknownEntityRenderer>;

/**
 * @public
 */
export interface IRendererCallbacks<TCtx>
{
    /**
     * Called once per frame, per plot drawn.
     */
    onBeforePlotDraw(context: TCtx, plotDimensions: IPlotDimensions, canvasDims: ICanvasDimensions): void;
    /**
     * Called once per frame, per plot drawn.
     */
    onAfterPlotDraw(context: TCtx): void;
}

/**
 * @public
 */
export type TChartGraphicsComponents<TEntityRenderer extends TUnknownEntityRenderer> =
    Map<string, IGraphicsComponentSpecification<TEntityRenderer, unknown, unknown>>
    ;

/**
 * @public
 * Base wrapper for the underlying drawing technology, use to get specific drawing programs. Implementations provide
 * hooks ({@link IRendererCallbacks}) on plot draw.
 */
export interface IRenderer<TEntityRenderer extends TUnknownEntityRenderer>
{
    readonly context: TExtractGcContext<TEntityRenderer>;
    readonly entityRendererProvider: IEntityRendererProvider<TEntityRenderer>;
    readonly entityRendererFactory: IEntityRendererFactory<TExtractGcSpec<TEntityRenderer>, TEntityRenderer>;
    readonly graphicsComponents: TChartGraphicsComponents<TEntityRenderer>;
    readonly sharedState: IRendererSharedState;

    onContextRegained(context: TExtractGcContext<TEntityRenderer>): void;

    createCompositeGraphicsComponent<TUpdateArg, TTraits>
    (
        graphicsComp: IGraphicsComponentSpecification<TEntityRenderer, TUpdateArg, TTraits>,
        plot: IReadonlyPlot<unknown, TTraits>,
    )
        : CompositeGraphicsComponent<TEntityRenderer, TUpdateArg, TTraits>;

    onBeforePlotDraw(plot: IReadonlyPlot<unknown, unknown>, canvasDims: ICanvasDimensions): void;
    onAfterPlotDraw(): void;
}