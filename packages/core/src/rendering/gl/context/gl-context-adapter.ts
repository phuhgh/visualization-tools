import { TGlContext } from "../t-gl-context";
import { ICanvasDimensions } from "../../../templating/canvas-dimensions";
import { IContextAdapter } from "../../i-context-adapter";
import { IEventService } from "../../../eventing/event-service";
import { OnRendererContextRestored } from "../../events/on-renderer-context-restored";
import { OnRendererContextLost } from "../../events/on-renderer-context-lost";

/**
 * @public
 * Base webgl context adapter. Handles viewport and context loss.
 */
export abstract class GlContextAdapter<TCtx extends TGlContext> implements IContextAdapter<TCtx>
{
    protected constructor
    (
        private readonly canvasElement: HTMLCanvasElement,
        private readonly eventService: IEventService,
        private readonly ctxId: "webgl" | "webgl2",
        private readonly options: WebGLContextAttributes | undefined,
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
            OnRendererContextLost.emit(this.eventService);
        });

        this.canvasElement.addEventListener("webglcontextrestored", (e) =>
        {
            e.preventDefault();
            this.getContext();

            if (this.lastCanvasDims != null)
            {
                this.onResize(this.lastCanvasDims);
            }

            OnRendererContextRestored.emit(this.eventService);
        });
    }

    protected context: TCtx | null = null;
    private lastCanvasDims: ICanvasDimensions | null = null;
}
