import { IRendererSharedState } from "../../rendering/i-renderer-shared-state";
import { IReadonlyRange2d, TTypedArray } from "rc-js-util";
import { EntityBufferStore, IEntityBufferStore } from "../../rendering/buffers/entity-buffer-store";
import { TUnknownBufferLayout } from "../../rendering/buffers/buffer-layout";

/**
 * @internal
 */
export class TestRendererSharedState implements IRendererSharedState
{
    public readonly frameCounter: number = 0;
    public scissorRange: IReadonlyRange2d<TTypedArray> | null = null;
    public readonly entityBuffers: IEntityBufferStore<TUnknownBufferLayout> = new EntityBufferStore();

    public onContextLost(): void
    {
        // override as required
    }

    public onNewFrame(): void
    {
        // override as required
    }

    public updateScissorRange(scissorRange: IReadonlyRange2d<TTypedArray> | null): void
    {
        this.scissorRange = scissorRange;
    }

}