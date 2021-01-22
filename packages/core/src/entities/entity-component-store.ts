import { _Debug } from "rc-js-util";

/**
 * @public
 * Place to store components for entity groups. It is taken as a membership requirement that the component be present,
 * if this is not the case the `TComponent` type should include undefined in the union.
 */
export interface IEntityComponentStore<TEntity extends object, TComponent>
{
    getComponent(entity: TEntity): TComponent;
    setComponent(entity: TEntity, component: TComponent): void;
    deleteComponent(entity: TEntity): void;
}

/**
 * @public
 * {@inheritDoc IEntityComponentStore}
 */
export class EntityComponentStore<TEntity extends object, TComponent>
    implements IEntityComponentStore<TEntity, TComponent>
{
    public getComponent(entity: TEntity): TComponent
    {
        DEBUG_MODE && _Debug.assert(this.components.has(entity), "expected to find component");
        return this.components.get(entity) as TComponent;
    }

    public setComponent(entity: TEntity, component: TComponent): void
    {
        this.components.set(entity, component);
    }

    public deleteComponent(entity: TEntity): void
    {
        this.components.delete(entity);
    }

    private components: WeakMap<TEntity, TComponent> = new WeakMap();
}