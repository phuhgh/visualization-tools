import { _Array } from "rc-js-util";

/**
 * @public
 * A store of categories of entities in an entity group (effectively sub group).
 */
export interface ICategoryStore<TCategory>
{
    addCategory(category: TCategory): TCategory;
    removeCategory(category: TCategory): void;

    toArray(): readonly TCategory[];
}

/**
 * @public
 * {@inheritDoc ICategoryStore}
 */
export class CategoryStore<TCategory> implements ICategoryStore<TCategory>
{
    public constructor
    (
        private readonly categories: TCategory[] = [],
    )
    {
    }

    public addCategory(category: TCategory): TCategory
    {
        this.categories.push(category);

        return category;
    }

    public toArray(): readonly TCategory[]
    {
        return this.categories;
    }

    public removeCategory(category: TCategory): void
    {
        _Array.removeOne(this.categories, category);
    }
}

