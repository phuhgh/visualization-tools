import { BroadcastEvent, IBroadcastEvent, TListener } from "rc-js-util";

/**
 * @public
 * Utility type for extracting types out of event categories.
 */
export interface IEventCategoryCtor<TKey extends string, TArgs extends unknown[]>
{
    readonly callbackKey: TKey;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new(...args: never[]): TListener<TKey, TArgs>;
}

/**
 * @public
 * A store of event categories that can be used to emit events.
 */
export interface IEventService
{
    getCategory<TKey extends string, TArgs extends unknown[]>
    (
        category: IEventCategoryCtor<TKey, TArgs>,
    )
        : IBroadcastEvent<TKey, TArgs>;
}

/**
 * @public
 * {@inheritDoc IEventService}
 */
export class EventService implements IEventService
{
    public getCategory<TKey extends string, TArgs extends unknown[]>
    (
        category: IEventCategoryCtor<TKey, TArgs>,
    )
        : IBroadcastEvent<TKey, TArgs>
    {
        let broadcastEvent = this.categories.get(category);

        if (broadcastEvent == null)
        {
            broadcastEvent = new BroadcastEvent(category.callbackKey);
            this.categories.set(category, broadcastEvent);
        }

        return broadcastEvent as IBroadcastEvent<TKey, TArgs>;
    }

    private categories = new WeakMap<object, IBroadcastEvent<string, unknown[]>>();
}
