import { IReadonlyRange2d, TTypedArray } from "rc-js-util";

/**
 * @public
 * Render state that persists between draw calls.
 */
export interface IRendererSharedState
{
    readonly frameCounter: number;
    readonly scissorRange: IReadonlyRange2d<TTypedArray> | null;
    onNewFrame(): void;
    updateScissorRange(scissorRange: IReadonlyRange2d<TTypedArray> | null): void;
    onContextLost(): void;
}