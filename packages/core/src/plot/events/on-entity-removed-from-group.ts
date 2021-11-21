import { IReadonlyPlot } from "../i-plot";
import { TListener } from "rc-js-util";
import { TEntityTrait } from "../../entities/traits/t-entity-trait";
import { IEntityGroup } from "../../entities/groups/a-entity-group";
import { IPlotRange } from "../i-plot-range";

/**
 * @public
 * Args for {@link TOnEntityRemovedFromGroup}.
 */
export type TEntityRemovedFromGroupArgs<TTraits>
    = [entity: TEntityTrait<unknown, TTraits>, group: IEntityGroup<unknown, TTraits>,]
    ;

/**
 * @public
 * Listener for entity removed form group.
 */
export type TOnEntityRemovedFromGroup<TTraits> =
    TListener<"onEntityRemovedFromGroup", TEntityRemovedFromGroupArgs<TTraits>>
    ;

/**
 * @public
 * Emitted on entity removed from group, if the entity is not present this is not emitted.
 */
export class OnEntityRemovedFromGroup<TTraits>
    implements TOnEntityRemovedFromGroup<TTraits>
{
    public static callbackKey = "onEntityRemovedFromGroup" as const;

    public constructor
    (
        public onEntityRemovedFromGroup: (...args: TEntityRemovedFromGroupArgs<TTraits>) => void,
    )
    {
    }

    public static registerListener<TTraits>
    (
        plot: IReadonlyPlot<IPlotRange, TTraits>,
        onEvent: (...args: TEntityRemovedFromGroupArgs<TTraits>) => void,
    )
        : () => void
    {
        return plot.eventService
            .getCategory<"onEntityRemovedFromGroup", TEntityRemovedFromGroupArgs<TTraits>>(OnEntityRemovedFromGroup)
            .addTemporaryListener(new OnEntityRemovedFromGroup(onEvent));
    }

    public static registerOneTimeListener<TTraits>
    (
        plot: IReadonlyPlot<IPlotRange, TTraits>,
        onEvent: (...args: TEntityRemovedFromGroupArgs<TTraits>) => void,
    )
        : () => void
    {
        return plot.eventService
            .getCategory<"onEntityRemovedFromGroup", TEntityRemovedFromGroupArgs<TTraits>>(OnEntityRemovedFromGroup)
            .addOneTimeListener(new OnEntityRemovedFromGroup(onEvent));
    }

    public static emit<TGroupTraits, TRequiredTraits>
    (
        plot: IReadonlyPlot<IPlotRange, TRequiredTraits>,
        entity: TEntityTrait<unknown, TGroupTraits & TRequiredTraits>,
        group: IEntityGroup<unknown, TGroupTraits>,
    )
        : void
    {
        const listeners = plot.eventService
            .getCategory<"onEntityRemovedFromGroup", TEntityRemovedFromGroupArgs<TGroupTraits>>(OnEntityRemovedFromGroup)
            .getTargets();

        for (let i = 0, iEnd = listeners.length; i < iEnd; ++i)
        {
            listeners[i].onEntityRemovedFromGroup(entity, group);
        }
    }
}