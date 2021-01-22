import { IContextChangeHooks } from "./i-context-change-hooks";
import { ICanvasDimensions } from "../templating/canvas-dimensions";

/**
 * @public
 * Hooks for context loss etc.
 */
export interface IContextAdapter<TCtx>
{
    readonly graphContextChangeHooks: IContextChangeHooks;

    onResize(canvasDims: ICanvasDimensions): void;
    getContext(): TCtx | null;
}