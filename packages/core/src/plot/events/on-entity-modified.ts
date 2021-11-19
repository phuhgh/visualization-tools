import { TListener } from "rc-js-util";
import { TEntityTrait } from "../../entities/traits/t-entity-trait";
import { IPlot, IReadonlyPlot } from "../i-plot";
import { IPlotRange } from "../i-plot-range";

/**
 * @public
 * Args for {@link TOnEntityModified}.
 */
export type TEntityModifiedArgs<TPlotRange extends IPlotRange, TRequiredTraits>
    = [entity: TEntityTrait<unknown, TRequiredTraits>, plot: IPlot<TPlotRange, TRequiredTraits>]
    ;

/**
 * @public
 * Listener for entity modification.
 */
export type TOnEntityModified<TPlotRange extends IPlotRange, TRequiredTraits> =
    TListener<"onEntityModified", TEntityModifiedArgs<TPlotRange, TRequiredTraits>>
    ;

/**
 * @public
 * Emit on a plot to indicate that an entity has been modified and that caches should be regenerated. Refer to the group's
 * documentation as to the conditions where this is required.
 */
export class OnEntityModified<TPlotRange extends IPlotRange, TRequiredTraits>
    implements TOnEntityModified<TPlotRange, TRequiredTraits>
{
    public static callbackKey = "onEntityModified" as const;

    public constructor
    (
        public onEntityModified: (...args: TEntityModifiedArgs<TPlotRange, TRequiredTraits>) => void,
    )
    {
    }

    public static registerListener<TPlotRange extends IPlotRange, TRequiredTraits>
    (
        plot: IReadonlyPlot<TPlotRange, TRequiredTraits>,
        onEvent: (...args: TEntityModifiedArgs<TPlotRange, TRequiredTraits>) => void,
    )
        : () => void
    {
        return plot.eventService
            .getCategory<"onEntityModified", TEntityModifiedArgs<TPlotRange, TRequiredTraits>>(OnEntityModified)
            .addTemporaryListener(new OnEntityModified(onEvent));
    }

    public static registerOneTimeListener<TPlotRange extends IPlotRange, TRequiredTraits>
    (
        plot: IReadonlyPlot<TPlotRange, TRequiredTraits>,
        onEvent: (...args: TEntityModifiedArgs<TPlotRange, TRequiredTraits>) => void,
    )
        : () => void
    {
        return plot.eventService
            .getCategory<"onEntityModified", TEntityModifiedArgs<TPlotRange, TRequiredTraits>>(OnEntityModified)
            .addOneTimeListener(new OnEntityModified(onEvent));
    }

    public static emit<TPlotRange extends IPlotRange, TRequiredTraits>
    (
        plot: IPlot<TPlotRange, TRequiredTraits>,
        entity: TEntityTrait<unknown, TRequiredTraits>,
    )
        : void
    {
        const listeners = plot.eventService
            .getCategory(OnEntityModified)
            .getTargets();

        for (let i = 0, iEnd = listeners.length; i < iEnd; ++i)
        {
            listeners[i].onEntityModified(entity, plot);
        }
    }
}