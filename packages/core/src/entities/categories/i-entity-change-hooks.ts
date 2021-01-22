/**
 * @public
 * Group entity membership hooks.
 */
export interface IEntityChangeHooks<TEntity>
{
    onEntityAdded(entity: TEntity): void;
    onEntityRemoved(entity: TEntity): void;
}