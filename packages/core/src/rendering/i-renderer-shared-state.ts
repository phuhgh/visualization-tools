import { IReadonlyRange2d, TTypedArray } from "rc-js-util";
import { IEntityBufferStore } from "./buffers/entity-buffer-store";
import { TUnknownBufferLayout } from "./buffers/buffer-layout";

/**
 * @public
 * Render state that persists between draw calls.
 */
export interface IRendererSharedState
{
    readonly frameCounter: number;
    readonly scissorRange: IReadonlyRange2d<TTypedArray> | null;
    readonly entityBuffers: IEntityBufferStore<TUnknownBufferLayout>;
    onNewFrame(): void;
    updateScissorRange(scissorRange: IReadonlyRange2d<TTypedArray> | null): void;
    onContextLost(): void;
}