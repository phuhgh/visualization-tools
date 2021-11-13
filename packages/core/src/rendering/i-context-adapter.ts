import { ICanvasDimensions } from "../templating/canvas-dimensions";

/**
 * @public
 * Wrapper of renderer context.
 */
export interface IContextAdapter<TCtx>
{
    onResize(canvasDims: ICanvasDimensions): void;
    getContext(): TCtx | null;
}