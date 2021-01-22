import { I2dEntityCategoryRead } from "./i2d-entity-category-read";
import { IUpdate2dGroup } from "./update-2d-group";
import { EntityCategory, ICategoryUpdateHooks, IPlot, IRenderer, TUnknownEntityRenderer } from "@visualization-tools/core";

/**
 * @public
 * Update category for 2d plots. Provides Z-ordering.
 */
export class EntityCategory2d<TEntityRenderer extends TUnknownEntityRenderer
    , TPlotRange
    , TUpdateArg
    , TRequiredTraits>
    extends EntityCategory<TEntityRenderer, TPlotRange, TUpdateArg, TRequiredTraits>
    implements I2dEntityCategoryRead<TUpdateArg, TRequiredTraits>
{
    public entityZIndexRange: number = 0;
    public zIndex: number = EntityCategory2d.counter++; // todo jack26: actually set these

    public constructor
    (
        plot: IPlot<TPlotRange, TRequiredTraits>,
        renderer: IRenderer<TEntityRenderer>,
        updateGroup: IUpdate2dGroup<TPlotRange, TUpdateArg, TRequiredTraits>,
        updateHooks: ICategoryUpdateHooks<IRenderer<TEntityRenderer>, TUpdateArg>,
    )
    {
        super(plot, renderer, updateGroup, updateHooks);
        updateGroup.categories.addCategory(this);
    }

    private static counter = 0;
}