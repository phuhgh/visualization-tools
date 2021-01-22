import { IContextChangeHooks } from "../../i-context-change-hooks";
import { ContextChangeHooks } from "../../context-change-hooks";
import { GlContextAdapter } from "./gl-context-adapter";

/**
 * @public
 * Webgl1 context adapter. Handles viewport and context loss.
 */
export class Gl1ContextAdapter extends GlContextAdapter<WebGLRenderingContext>
{
    public constructor
    (
        canvasElement: HTMLCanvasElement,
        options?: WebGLContextAttributes,
        graphContextChangeHooks: IContextChangeHooks = new ContextChangeHooks(),
    )
    {
        super(canvasElement, "webgl", options, graphContextChangeHooks);
    }
}