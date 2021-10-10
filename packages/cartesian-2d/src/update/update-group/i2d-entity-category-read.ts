import { IEntityCategory, IEntityCategoryRead, TUnknownComponentRenderer } from "@visualization-tools/core";

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
export interface I2dEntityCategory<TComponentRenderer extends TUnknownComponentRenderer, TUpdateArg, TRequiredTraits>
    extends IEntityCategory<TComponentRenderer, TUpdateArg, TRequiredTraits>,
            I2dEntityCategoryRead<TUpdateArg, TRequiredTraits>
{
}