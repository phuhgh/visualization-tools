import { T2dAbsoluteZIndexTrait } from "../traits/t2d-absolute-z-index-trait";
import { IGlBinder, TGlBasicComponentRenderer } from "@visualization-tools/core";

/**
 * @public
 * Provides coordinate system invariant WebGL bindings for 2d graphics components.
 */
export interface IGlCamera2dBinder<TBinderData, TUpdateArg>
    extends IGlBinder<TGlBasicComponentRenderer, TBinderData>
{
    setZ(entity: T2dAbsoluteZIndexTrait): void;
    /**
     * Get the parameter for setData from the plot's update arg.
     */
    getBinderData(updateArg: TUpdateArg): TBinderData;
}