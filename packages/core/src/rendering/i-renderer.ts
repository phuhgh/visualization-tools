import { IComponentRendererProvider } from "./component-renderer/i-component-renderer-provider";
import { IComponentRendererFactory } from "./component-renderer/i-component-renderer-factory";
import { ICanvasDimensions } from "../templating/canvas-dimensions";
import { IPlotDimensions } from "../plot/plot-dimensions";
import { IReadonlyPlot } from "../plot/i-plot";
import { TUnknownComponentRenderer } from "./t-unknown-component-renderer";
import { IRendererSharedState } from "./i-renderer-shared-state";
import { TExtractGcSpec } from "./component-renderer/t-extract-gc-spec";
import { TExtractGcContext } from "./component-renderer/t-extract-gc-context";
import { ITransformComponentStore } from "./transform-components/transform-component-store";
import { IGraphicsComponentStore } from "./graphics-component-store";

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
 * Base wrapper for the underlying drawing technology, use to get specific drawing programs. Implementations provide
 * hooks ({@link IRendererCallbacks}) on plot draw.
 */
export interface IRenderer<TComponentRenderer extends TUnknownComponentRenderer>
{
    readonly context: TExtractGcContext<TComponentRenderer>;
    readonly componentRendererProvider: IComponentRendererProvider<TComponentRenderer>;
    readonly componentRendererFactory: IComponentRendererFactory<TExtractGcSpec<TComponentRenderer>, TComponentRenderer>;
    readonly graphicsComponents: IGraphicsComponentStore<TComponentRenderer>;
    readonly transformComponents: ITransformComponentStore<TUnknownComponentRenderer>;
    readonly sharedState: IRendererSharedState;

    onContextLost(): void;
    onContextRegained(context: TExtractGcContext<TComponentRenderer>): void;

    initializeBuffers(buffers: readonly unknown[]): void;
    destroyBuffers(buffers: readonly unknown[]): void;

    onBeforePlotDraw(plot: IReadonlyPlot<unknown, unknown>, canvasDims: ICanvasDimensions): void;
    onAfterPlotDraw(): void;

    TComponentRenderer: TComponentRenderer;
}