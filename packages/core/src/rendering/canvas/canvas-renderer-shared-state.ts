import { IRendererSharedState } from "../i-renderer-shared-state";
import { IReadonlyRange2d, TTypedArray } from "rc-js-util";
import { EntityBufferStore, IEntityBufferStore } from "../buffers/entity-buffer-store";
import { TUnknownBufferLayout } from "../buffers/buffer-layout";

/**
 * @public
 * Canvas state shared between draw calls. Some methods use the state stack, refer to documentation on individual
 * methods for usage notes.
 */
export class CanvasRendererSharedState implements IRendererSharedState
{
    public frameCounter: number = 0;
    public scissorRange: IReadonlyRange2d<TTypedArray> | null = null;
    public readonly entityBuffers: IEntityBufferStore<TUnknownBufferLayout> = new EntityBufferStore();

    public constructor
    (
        private context: CanvasRenderingContext2D,
    )
    {
    }

    public onNewFrame(): void
    {
        ++this.frameCounter;
    }

    public onContextLost(): void
    {
        // not currently required
    }

    /**
     * Where multiple ranges are provided the scissor range will be the intersection of these. Each of these must be
     * popped of the stack individually.
     */
    public updateScissorRange(scissorRange: IReadonlyRange2d<TTypedArray> | null): void
    {
        this.scissorRange = scissorRange;

        if (scissorRange == null)
        {
            this.context.restore();
        }
        else
        {
            this.context.save();
            this.context.beginPath();
            this.context.rect(
                scissorRange.getXMin() | 0,
                scissorRange.getYMin() | 0,
                scissorRange.getXRange() | 0,
                scissorRange.getYRange() | 0,
            );
            this.context.closePath();
            this.context.clip();
        }
    }

    public setContext(context: CanvasRenderingContext2D): void
    {
        this.context = context;
    }
}