import { IReadonlyPlot } from "../i-plot";
import { TListener } from "rc-js-util";
import { TEntityTrait } from "../../entities/traits/t-entity-trait";
import { IEntityGroup } from "../../entities/groups/a-entity-group";

/**
 * @public
 * Args for {@link TOnEntityAddedToGroup}.
 */
export type TEntityAddedToGroupArgs<TTraits>
    = [entity: TEntityTrait<unknown, TTraits>, group: IEntityGroup<unknown, TTraits>,]
    ;

/**
 * @public
 * Listener for entity being added to group.
 */
export type TOnEntityAddedToGroup<TTraits> =
    TListener<"onEntityAddedToGroup", TEntityAddedToGroupArgs<TTraits>>
    ;

/**
 * @public
 * Emitted on entity being added to a group, not emitted if entity is already in the group.
 */
export class OnEntityAddedToGroup<TTraits>
    implements TOnEntityAddedToGroup<TTraits>
{
    public static callbackKey = "onEntityAddedToGroup" as const;

    public constructor
    (
        public onEntityAddedToGroup: (...args: TEntityAddedToGroupArgs<TTraits>) => void,
    )
    {
    }

    public static registerListener<TRequiredTraits>
    (
        plot: IReadonlyPlot<unknown, TRequiredTraits>,
        onEvent: (...args: TEntityAddedToGroupArgs<TRequiredTraits>) => void,
    )
        : () => void
    {
        return plot.eventService
            .getCategory<"onEntityAddedToGroup", TEntityAddedToGroupArgs<TRequiredTraits>>(OnEntityAddedToGroup)
            .addTemporaryListener(new OnEntityAddedToGroup(onEvent));
    }

    public static registerOneTimeListener<TRequiredTraits>
    (
        plot: IReadonlyPlot<unknown, TRequiredTraits>,
        onEvent: (...args: TEntityAddedToGroupArgs<TRequiredTraits>) => void,
    )
        : () => void
    {
        return plot.eventService
            .getCategory<"onEntityAddedToGroup", TEntityAddedToGroupArgs<TRequiredTraits>>(OnEntityAddedToGroup)
            .addOneTimeListener(new OnEntityAddedToGroup(onEvent));
    }

    public static emit<TGroupTraits, TRequiredTraits>
    (
        plot: IReadonlyPlot<unknown, TRequiredTraits>,
        entity: TEntityTrait<unknown, TGroupTraits & TRequiredTraits>,
        group: IEntityGroup<unknown, TGroupTraits>,
    )
        : void
    {
        const listeners = plot.eventService
            .getCategory(OnEntityAddedToGroup)
            .getTargets();

        for (let i = 0, iEnd = listeners.length; i < iEnd; ++i)
        {
            listeners[i].onEntityAddedToGroup(entity, group);
        }
    }
}