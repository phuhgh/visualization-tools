import { AEntityGroup, CategoryStore, EntityComponentStore, ICategoryStore, IEntityComponentStore, IEntityGroup, IEntityUpdateArgProvider, IPlotRange, IUpdateGroupOptions, TEntityTrait, TGraphicsComponent, TUnknownComponentRenderer, TUnknownEntity } from "@visualization-tools/core";
import { I2dEntityCategory, I2dEntityCategoryRead } from "./i2d-entity-category-read";

/**
 * @public
 * Update group for drawable entities part of a 2d plot.
 */
export interface IUpdate2dGroup<TPlotRange extends IPlotRange, TUpdateArg, TRequiredTraits>
    extends IEntityGroup<IUpdateGroupOptions<TUpdateArg>, TRequiredTraits>
{
    readonly graphicsComponents: IEntityComponentStore<TUnknownEntity, TGraphicsComponent<TUnknownComponentRenderer, TUpdateArg, unknown>>;
    readonly updateArgProvider: IEntityUpdateArgProvider<TPlotRange, TUpdateArg, TRequiredTraits>;
    readonly categories: ICategoryStore<I2dEntityCategoryRead<TUpdateArg, TRequiredTraits>>;
}

/**
 * @public
 * {@inheritDoc IUpdate2dGroup}
 */
export class Update2dGroup<TPlotRange extends IPlotRange, TUpdateArg, TRequiredTraits>
    extends AEntityGroup<IUpdateGroupOptions<TUpdateArg>, TRequiredTraits>
    implements IUpdate2dGroup<TPlotRange, TUpdateArg, TRequiredTraits>
{
    public graphicsComponents: IEntityComponentStore<TUnknownEntity, TGraphicsComponent<TUnknownComponentRenderer, TUpdateArg, unknown>>;

    public constructor
    (
        public readonly updateArgProvider: IEntityUpdateArgProvider<TPlotRange, TUpdateArg, TRequiredTraits>,
        public readonly categories: ICategoryStore<I2dEntityCategory<TUnknownComponentRenderer, TUpdateArg, TRequiredTraits>> = new CategoryStore(),
    )
    {
        super();
        this.graphicsComponents = new EntityComponentStore();
    }

    public onEntityAdded
    (
        entity: TEntityTrait<TUpdateArg, TRequiredTraits>,
        options: IUpdateGroupOptions<TUpdateArg>,
    )
        : void
    {
        this.graphicsComponents.setComponent(entity, options.graphicsComponent);
        this.entitiesInGroup.add(entity);
    }

    public onEntityRemoved(entity: TEntityTrait<TUpdateArg, TRequiredTraits>): void
    {
        this.graphicsComponents.deleteComponent(entity);
        this.entitiesInGroup.delete(entity);
        const categories = this.categories.toArray();

        for (let i = 0, iEnd = categories.length; i < iEnd; ++i)
        {
            categories[i].removeEntity(entity);
        }
    }

    protected entitiesInGroup: Set<TEntityTrait<TUpdateArg, TRequiredTraits>> = new Set();
}
