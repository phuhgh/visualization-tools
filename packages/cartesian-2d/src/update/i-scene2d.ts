import { IGraphicsComponent, TEntityTrait, TUnknownEntityRenderer } from "@visualization-tools/core";
import { I2dEntityCategoryRead } from "./i2d-entity-category-read";
import { IUpdate2dGroup } from "./update-2d-group";

/**
 * @public
 */
export interface IScene2d<TPlotRange, TUpdateArg, TRequiredTraits>
{
    getSortedCategories
    (
        updateGroup: IUpdate2dGroup<TPlotRange, TUpdateArg, TRequiredTraits>,
    )
        : readonly I2dEntityCategoryRead<TUpdateArg, TRequiredTraits>[];

    getEntitiesByComponents
    (
        category: I2dEntityCategoryRead<TUpdateArg, TRequiredTraits>,
    )
        : readonly [IGraphicsComponent<TUnknownEntityRenderer, TUpdateArg, TRequiredTraits>, TEntityTrait<TUpdateArg, TRequiredTraits>[]][];

    update(): void;
}