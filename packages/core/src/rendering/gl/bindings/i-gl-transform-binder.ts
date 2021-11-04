import { TGl2ComponentRenderer } from "../component-renderer/t-gl2-component-renderer";
import { ITransformBinder } from "../../generic-binders/i-transform-binder";
import { IGlBinder } from "./a-gl-binder";
import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";

/**
 * @public
 * Data binder for webgl transform feedback components.
 */
export interface IGlTransformBinder<TConnector
    , TSwapBinder extends IGlBinder<TGlBasicComponentRenderer, TConnector>
    , TTransformRenderer extends TGl2ComponentRenderer>
    extends ITransformBinder<TTransformRenderer>
{
    /**
     * Swap their buffers with ours, using their buffers as inputs and ours as outputs.
     */
    swapBuffers(binder: TSwapBinder): void;
    setResultBuffers
    (
        connector: TConnector,
        exchangeBinder: TSwapBinder,
        transformRenderer: TTransformRenderer,
        usage?: GLenum,
    )
        : void;
    clearResultBuffers(transformRenderer: TTransformRenderer): void;
}
