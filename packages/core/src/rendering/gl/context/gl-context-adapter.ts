import { IContextChangeHooks } from "../../i-context-change-hooks";
import { TGlContext } from "../t-gl-context";
import { ICanvasDimensions } from "../../../templating/canvas-dimensions";
import { IContextAdapter } from "../../i-context-adapter";

/**
 * @public
 * Base webgl context adapter. Handles viewport and context loss.
 */
export abstract class GlContextAdapter<TCtx extends TGlContext> implements IContextAdapter<TCtx>
{
    protected constructor
    (
        private readonly canvasElement: HTMLCanvasElement,
        private readonly ctxId: "webgl" | "webgl2",
        private readonly options: WebGLContextAttributes | undefined,
        public readonly graphContextChangeHooks: IContextChangeHooks,
    )
    {
        this.registerEventHandlers();
    }

    public onResize(canvasDims: ICanvasDimensions): void
    {
        this.lastCanvasDims = canvasDims;

        if (this.context == null)
        {
            return;
        }

        this.context.viewport(0, 0, canvasDims.pixelDims.getXMax(), canvasDims.pixelDims.getYMax());
    }

    public getContext(): TCtx | null
    {
        if (this.context != null)
        {
            return this.context;
        }

        return this.context = this.canvasElement.getContext(this.ctxId, this.options) as TCtx | null;
    }

    private registerEventHandlers(): void
    {
        this.canvasElement.addEventListener("webglcontextlost", (e) =>
        {
            e.preventDefault();
            this.context = null;
        });

        this.canvasElement.addEventListener("webglcontextrestored", (e) =>
        {
            e.preventDefault();
            this.getContext();

            if (this.lastCanvasDims != null)
            {
                this.onResize(this.lastCanvasDims);
            }

            this.graphContextChangeHooks.onContextRestored();
        });
    }

    protected context: TCtx | null = null;
    private lastCanvasDims: ICanvasDimensions | null = null;
}
