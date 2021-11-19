import { I2dEntityCategoryRead } from "./i2d-entity-category-read";
import { IUpdate2dGroup } from "./update-2d-group";
import { EntityCategory, ICategoryUpdateHooks, IPlot, IPlotRange, IRenderer, TUnknownComponentRenderer } from "@visualization-tools/core";

/**
 * @public
 * Update category for 2d plots. Provides Z-ordering.
 */
export class EntityCategory2d<TComponentRenderer extends TUnknownComponentRenderer
    , TPlotRange extends IPlotRange
    , TUpdateArg
    , TRequiredTraits>
    extends EntityCategory<TComponentRenderer, TUpdateArg, TRequiredTraits>
    implements I2dEntityCategoryRead<TUpdateArg, TRequiredTraits>
{
    public entityZIndexRange: number = 0;
    public zIndex: number = EntityCategory2d.counter++; // todo jack26: actually set these

    public constructor
    (
        plot: IPlot<TPlotRange, TRequiredTraits>,
        renderer: IRenderer<TComponentRenderer>,
        updateGroup: IUpdate2dGroup<TPlotRange, TUpdateArg, TRequiredTraits>,
        updateHooks: ICategoryUpdateHooks<IRenderer<TComponentRenderer>, TUpdateArg>,
    )
    {
        super(plot, renderer, updateGroup, updateHooks);
        updateGroup.categories.addCategory(this);
    }

    private static counter = 0;
}