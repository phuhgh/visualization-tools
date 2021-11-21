import { IGlBinder, TGlBasicComponentRenderer, TGlF32BufferLayout } from "@visualization-tools/core";
import { T2dAbsoluteZIndexTrait } from "../traits/t2d-absolute-z-index-trait";

/**
 * @public
 * Provides coordinate system invariant WebGL bindings for 2d graphics components.
 */
export interface IGlCamera2dBinder<TConnector, TUpdateArg>
    extends IGlBinder<TGlBasicComponentRenderer, TConnector, TGlF32BufferLayout>
{
    /**
     * Get the parameter for setData from the plot's update arg.
     */
    getBinderData(entity: T2dAbsoluteZIndexTrait, updateArg: TUpdateArg, renderer: TGlBasicComponentRenderer): TConnector;
}