import { TListener } from "rc-js-util";
import { TEntityTrait } from "../../entities/traits/t-entity-trait";
import { IReadonlyPlot } from "../i-plot";
import { IEventService } from "../../eventing/event-service";
import { IChartComponent } from "../../chart/chart-component";
import { TUnknownRenderer } from "../../rendering/t-unknown-renderer";
import { IPlotRange } from "../i-plot-range";

/**
 * @public
 * Args for {@link TOnEntityAdded}.
 */
export type TEntityAddedArgs<TRequiredTraits>
    = [entity: TEntityTrait<unknown, TRequiredTraits>]
    ;

/**
 * @public
 * Listener for entity added to plot.
 */
export type TOnEntityAdded<TRequiredTraits> =
    TListener<"onEntityAdded", TEntityAddedArgs<TRequiredTraits>>
    ;

/**
 * @public
 * Emitted on entity added to plot.
 */
export class OnEntityAdded<TRequiredTraits>
    implements TOnEntityAdded<TRequiredTraits>
{
    public static callbackKey = "onEntityAdded" as const;

    public constructor
    (
        public onEntityAdded: (...args: TEntityAddedArgs<TRequiredTraits>) => void,
    )
    {
    }

    public static registerListener<TRequiredTraits>
    (
        owner: IReadonlyPlot<IPlotRange, TRequiredTraits> | IChartComponent<TUnknownRenderer>,
        onEvent: (...args: TEntityAddedArgs<TRequiredTraits>) => void,
    )
        : () => void
    {
        return owner.eventService
            .getCategory<"onEntityAdded", TEntityAddedArgs<TRequiredTraits>>(OnEntityAdded)
            .addTemporaryListener(new OnEntityAdded(onEvent));
    }

    public static registerOneTimeListener<TRequiredTraits>
    (
        owner: IReadonlyPlot<IPlotRange, TRequiredTraits> | IChartComponent<TUnknownRenderer>,
        onEvent: (...args: TEntityAddedArgs<TRequiredTraits>) => void,
    )
        : () => void
    {
        return owner.eventService
            .getCategory<"onEntityAdded", TEntityAddedArgs<TRequiredTraits>>(OnEntityAdded)
            .addOneTimeListener(new OnEntityAdded(onEvent));
    }

    public static emit<TRequiredTraits>
    (
        eventService: IEventService,
        entity: TEntityTrait<unknown, TRequiredTraits>,
    )
        : void
    {
        const listeners = eventService
            .getCategory(OnEntityAdded)
            .getTargets();

        for (let i = 0, iEnd = listeners.length; i < iEnd; ++i)
        {
            listeners[i].onEntityAdded(entity);
        }
    }
}