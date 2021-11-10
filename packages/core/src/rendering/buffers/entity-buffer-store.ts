import { TUnknownEntity } from "../../entities/t-unknown-entity";
import { _Array, _Map } from "rc-js-util";
import { TUnknownBufferLayout } from "./buffer-layout";

/**
 * @public
 */
export interface IEntityBufferStore<TBufferLayout extends TUnknownBufferLayout>
{
    getLayout(entity: TUnknownEntity, groupId: number): TBufferLayout | undefined;
    getLayouts(entity: TUnknownEntity): Map<number, TBufferLayout> | undefined;
    /**
     * Only set the buffer if it has not previously been set for this combination.
     * @returns true if the `bufferLayout` was new.
     */
    setNewLayout(entity: TUnknownEntity, groupId: number, bufferLayout: TBufferLayout): boolean;
    clearLayout(entity: TUnknownEntity, groupId: number): void;
    clearLayouts(entity: TUnknownEntity): void;
    getAllLayouts(): TBufferLayout[];
}

/**
 * @public
 */
export class EntityBufferStore<TBufferLayout extends TUnknownBufferLayout>
    implements IEntityBufferStore<TBufferLayout>
{
    public clearLayout(entity: TUnknownEntity, groupId: number): void
    {
        const byId = this.bufferLayouts.get(entity);

        if (byId != null)
        {
            byId.delete(groupId);
        }
    }

    public clearLayouts(entity: TUnknownEntity): void
    {
        this.bufferLayouts.delete(entity);
    }

    public getLayout(entity: TUnknownEntity, groupId: number): TBufferLayout | undefined
    {
        const byId = this.bufferLayouts.get(entity);

        if (byId == null)
        {
            return undefined;
        }

        return byId.get(groupId);
    }

    public setNewLayout(entity: TUnknownEntity, groupId: number, bufferLayout: TBufferLayout): boolean
    {
        const byId = _Map.initializeGet(this.bufferLayouts, entity, () => new Map());

        if (byId.has(groupId))
        {
            return false;
        }

        byId.set(groupId, bufferLayout);

        return true;
    }

    public getAllLayouts(): TBufferLayout[]
    {
        const groupedLayouts = _Map.arrayMap(this.bufferLayouts, bufferLayout => _Map.valuesToArray(bufferLayout));

        return _Array.flatMap(groupedLayouts, (groupedLayout) => groupedLayout);
    }

    public getLayouts(entity: TUnknownEntity): Map<number, TBufferLayout> | undefined
    {
        return this.bufferLayouts.get(entity);
    }

    private readonly bufferLayouts = new Map<TUnknownEntity, Map<number, TBufferLayout>>();
}
