import { IEntityCategory, IEntityCategoryRead, TUnknownEntityRenderer } from "@visualization-tools/core";

/**
 * @public
 */
export interface I2dEntityCategoryRead<TUpdateArg, TRequiredTraits>
    extends IEntityCategoryRead<TUpdateArg, TRequiredTraits>
{
    zIndex: number;
    entityZIndexRange: number;
}

/**
 * @public
 */
export interface I2dEntityCategory<TEntityRenderer extends TUnknownEntityRenderer, TUpdateArg, TRequiredTraits>
    extends IEntityCategory<TEntityRenderer, TUpdateArg, TRequiredTraits>,
            I2dEntityCategoryRead<TUpdateArg, TRequiredTraits>
{
}