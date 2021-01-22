import { _Debug, _Set } from "rc-js-util";
import { EntityUpdateGrouping } from "./entity-update-grouping";
import { TEntityTrait } from "../entities/traits/t-entity-trait";
import { ICategoryUpdateHooks } from "../entities/categories/i-category-update-hooks";
import { TUnknownRenderer } from "../rendering/i-renderer";

/**
 * @public
 * Provides a grouping of entities and graphics components to update.
 */
export class RenderList<TUpdateArg, TRequiredTraits>
{
    public readonly groupings: [EntityUpdateGrouping<TUpdateArg, TRequiredTraits>, TEntityTrait<TUpdateArg, TRequiredTraits>[]][] = [];
    public entitiesInGroup: TEntityTrait<TUpdateArg, TRequiredTraits>[] = [];

    public constructor
    (
        public readonly updateGroupHooks: ICategoryUpdateHooks<TUnknownRenderer, TUpdateArg>,
    )
    {
    }

    public addGrouping(grouping: EntityUpdateGrouping<TUpdateArg, TRequiredTraits>): void
    {
        this.currentGrouping = [grouping, []];
        this.groupings.push(this.currentGrouping);
    }

    public addEntity
    (
        entity: TEntityTrait<TUpdateArg, TRequiredTraits>,
    )
        : void
    {
        DEBUG_MODE && _Debug.assert(this.currentGrouping != null, "expected to find grouping");
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.currentGrouping![1].push(entity);
        this.uniqueEntitiesSet.add(entity);
    }

    public build(): void
    {
        this.entitiesInGroup = _Set.valuesToArray(this.uniqueEntitiesSet);
        this.uniqueEntitiesSet.clear();
    }

    private currentGrouping: [EntityUpdateGrouping<TUpdateArg, TRequiredTraits>, TEntityTrait<TUpdateArg, TRequiredTraits>[]] | null = null;
    private uniqueEntitiesSet = new Set<TEntityTrait<TUpdateArg, TRequiredTraits>>();
}