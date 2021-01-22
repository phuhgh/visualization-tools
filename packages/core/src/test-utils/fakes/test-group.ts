import { AEntityGroup, IEntityGroup } from "../../entities/groups/a-entity-group";
import { TEntityTrait } from "../../entities/traits/t-entity-trait";

/**
 * @internal
 */
export class TestGroup extends AEntityGroup<unknown, unknown> implements IEntityGroup<unknown, unknown>
{
    protected entitiesInGroup: Set<TEntityTrait<unknown, unknown>> = new Set();

    public onEntityAdded(entity: TEntityTrait<unknown, unknown>): void
    {
        this.entitiesInGroup.add(entity);
    }

    public onEntityRemoved(entity: TEntityTrait<unknown, unknown>): void
    {
        this.entitiesInGroup.delete(entity);
    }
}