import { IContextChangeHooks } from "../../i-context-change-hooks";
import { ContextChangeHooks } from "../../context-change-hooks";
import { GlContextAdapter } from "./gl-context-adapter";

/**
 * @public
 * Webgl2 context adapter. Handles viewport and context loss.
 */
export class Gl2ContextAdapter extends GlContextAdapter<WebGL2RenderingContext>
{
    public constructor
    (
        canvasElement: HTMLCanvasElement,
        options?: WebGLContextAttributes,
        graphContextChangeHooks: IContextChangeHooks = new ContextChangeHooks(),
    )
    {
        super(canvasElement, "webgl2", options, graphContextChangeHooks);
    }
}