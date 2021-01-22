import { TListener } from "rc-js-util";
import { TEntityTrait } from "../../entities/traits/t-entity-trait";
import { IPlot, IReadonlyPlot } from "../i-plot";

/**
 * @public
 * Args for {@link TOnEntityAdded}.
 */
export type TEntityAddedArgs<TPlotRange, TRequiredTraits>
    = [entity: TEntityTrait<unknown, TRequiredTraits>, plot: IPlot<TPlotRange, TRequiredTraits>]
    ;

/**
 * @public
 * Listener for entity added to plot.
 */
export type TOnEntityAdded<TPlotRange, TRequiredTraits> =
    TListener<"onEntityAdded", TEntityAddedArgs<TPlotRange, TRequiredTraits>>
    ;

/**
 * @public
 * Emitted on entity added to plot.
 */
export class OnEntityAdded<TPlotRange, TRequiredTraits>
    implements TOnEntityAdded<TPlotRange, TRequiredTraits>
{
    public static callbackKey = "onEntityAdded" as const;

    public constructor
    (
        public onEntityAdded: (...args: TEntityAddedArgs<TPlotRange, TRequiredTraits>) => void,
    )
    {
    }

    public static registerListener<TPlotRange, TRequiredTraits>
    (
        plot: IReadonlyPlot<TPlotRange, TRequiredTraits>,
        onEvent: (...args: TEntityAddedArgs<TPlotRange, TRequiredTraits>) => void,
    )
        : () => void
    {
        return plot.eventService
            .getCategory<"onEntityAdded", TEntityAddedArgs<TPlotRange, TRequiredTraits>>(OnEntityAdded)
            .addTemporaryListener(new OnEntityAdded(onEvent));
    }

    public static registerOneTimeListener<TPlotRange, TRequiredTraits>
    (
        plot: IReadonlyPlot<TPlotRange, TRequiredTraits>,
        onEvent: (...args: TEntityAddedArgs<TPlotRange, TRequiredTraits>) => void,
    )
        : () => void
    {
        return plot.eventService
            .getCategory<"onEntityAdded", TEntityAddedArgs<TPlotRange, TRequiredTraits>>(OnEntityAdded)
            .addOneTimeListener(new OnEntityAdded(onEvent));
    }

    public static emit<TPlotRange, TRequiredTraits>
    (
        plot: IPlot<TPlotRange, TRequiredTraits>,
        entity: TEntityTrait<unknown, TRequiredTraits>,
    )
        : void
    {
        const listeners = plot.eventService
            .getCategory(OnEntityAdded)
            .getTargets();

        for (let i = 0, iEnd = listeners.length; i < iEnd; ++i)
        {
            listeners[i].onEntityAdded(entity, plot);
        }
    }
}