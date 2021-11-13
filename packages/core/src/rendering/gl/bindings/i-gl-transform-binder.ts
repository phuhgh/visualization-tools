import { TGl2ComponentRenderer } from "../component-renderer/t-gl2-component-renderer";
import { ITransformBinder } from "../../generic-binders/i-transform-binder";
import { IGlBinder } from "./a-gl-binder";
import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";
import { TUnknownBufferLayout } from "../../buffers/buffer-layout";

/**
 * @public
 * Data binder for webgl transform feedback components.
 */
export interface IGlTransformBinder<TConnector
    , TBinder extends IGlBinder<TGlBasicComponentRenderer, TConnector, TUnknownBufferLayout>
    , TTransformRenderer extends TGl2ComponentRenderer>
    extends ITransformBinder<TTransformRenderer>
{
    setResultBuffers
    (
        connector: TConnector,
        exchangeBinder: TBinder,
        transformRenderer: TTransformRenderer,
        usage?: GLenum,
    )
        : void;

    clearResultBuffers(transformRenderer: TTransformRenderer): void;
}
