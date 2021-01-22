import { TListener } from "rc-js-util";
import { TEntityTrait } from "../../entities/traits/t-entity-trait";
import { IPlot, IReadonlyPlot } from "../i-plot";

/**
 * @public
 * Args for {@link TOnEntityRemoved}.
 */
export type TEntityRemovedArgs<TPlotRange, TRequiredTraits> = [entity: TEntityTrait<unknown, TRequiredTraits>, plot: IPlot<TPlotRange, TRequiredTraits>];

/**
 * @public
 * Listener for entity removed form plot.
 */
export type TOnEntityRemoved<TPlotRange, TRequiredTraits> =
    TListener<"onEntityRemoved", TEntityRemovedArgs<TPlotRange, TRequiredTraits>>
    ;

/**
 * @public
 * Emitted on entity removed from plot, if the entity is not present this is not emitted.
 */
export class OnEntityRemoved<TPlotRange, TRequiredTraits>
    implements TOnEntityRemoved<TPlotRange, TRequiredTraits>
{
    public static callbackKey = "onEntityRemoved" as const;

    public constructor
    (
        public onEntityRemoved: (...args: TEntityRemovedArgs<TPlotRange, TRequiredTraits>) => void,
    )
    {
    }

    public static registerListener<TPlotRange, TRequiredTraits>
    (
        plot: IReadonlyPlot<TPlotRange, TRequiredTraits>,
        onEvent: (...args: TEntityRemovedArgs<TPlotRange, TRequiredTraits>) => void,
    )
        : () => void
    {
        return plot.eventService
            .getCategory<"onEntityRemoved", TEntityRemovedArgs<TPlotRange, TRequiredTraits>>(OnEntityRemoved)
            .addTemporaryListener(new OnEntityRemoved(onEvent));
    }

    public static registerOneTimeListener<TPlotRange, TRequiredTraits>
    (
        plot: IReadonlyPlot<TPlotRange, TRequiredTraits>,
        onEvent: (...args: TEntityRemovedArgs<TPlotRange, TRequiredTraits>) => void,
    )
        : () => void
    {
        return plot.eventService
            .getCategory<"onEntityRemoved", TEntityRemovedArgs<TPlotRange, TRequiredTraits>>(OnEntityRemoved)
            .addOneTimeListener(new OnEntityRemoved(onEvent));
    }

    public static emit<TPlotRange, TRequiredTraits>
    (
        plot: IPlot<TPlotRange, TRequiredTraits>,
        entity: TEntityTrait<unknown, TRequiredTraits>,
    )
        : void
    {
        const listeners = plot.eventService
            .getCategory<"onEntityRemoved", TEntityRemovedArgs<TPlotRange, TRequiredTraits>>(OnEntityRemoved)
            .getTargets();

        for (let i = 0, iEnd = listeners.length; i < iEnd; ++i)
        {
            listeners[i].onEntityRemoved(entity, plot);
        }
    }
}