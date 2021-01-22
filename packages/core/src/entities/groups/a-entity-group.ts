import { TEntityTrait } from "../traits/t-entity-trait";

/**
 * @public
 * A group of entities that implement `TRequiredTraits`.
 */
export interface IEntityGroup<TOptions, TRequiredTraits>
    extends IReadonlyEntityGroup<TRequiredTraits>,
            IWritableEntityGroup<TOptions, TRequiredTraits>
{
}

/**
 * @public
 * Provides a way to check if an entity is in this group.
 */
export interface IReadonlyEntityGroup<TRequiredTraits>
{
    TTypeRequiredTrait: TRequiredTraits;

    isEntityInGroup<TUpdateArg>(entity: TEntityTrait<TUpdateArg, unknown>): entity is TEntityTrait<TUpdateArg, TRequiredTraits>;
}

/**
 * @public
 * Provides hooks for changes to membership of this group.
 */
export interface IWritableEntityGroup<TOptions, TRequiredTraits>
{
    onEntityAdded(entity: TEntityTrait<unknown, TRequiredTraits>, options: TOptions): void;
    onEntityRemoved(entity: TEntityTrait<unknown, TRequiredTraits>): void;
}

/**
 * @public
 * {@inheritDoc IEntityGroup}
 */
export abstract class AEntityGroup<TOptions, TRequiredTraits> implements IEntityGroup<TOptions, TRequiredTraits>
{
    public TTypeRequiredTrait!: TRequiredTraits;

    public abstract onEntityAdded(entity: TEntityTrait<unknown, TRequiredTraits>, options: TOptions): void;

    public abstract onEntityRemoved(entity: TEntityTrait<unknown, TRequiredTraits>): void;

    public isEntityInGroup<TUpdateArg>(entity: TEntityTrait<TUpdateArg, unknown>): entity is TEntityTrait<TUpdateArg, TRequiredTraits>
    {
        return this.entitiesInGroup.has(entity as TEntityTrait<TUpdateArg, TRequiredTraits>);
    }

    protected abstract entitiesInGroup: Set<TEntityTrait<unknown, TRequiredTraits>>;
}