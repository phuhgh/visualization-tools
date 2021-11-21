import { TListener } from "rc-js-util";
import { TEntityTrait } from "../../entities/traits/t-entity-trait";
import { IReadonlyPlot } from "../i-plot";
import { IEventService } from "../../eventing/event-service";
import { IChartComponent } from "../../chart/chart-component";
import { TUnknownRenderer } from "../../rendering/t-unknown-renderer";
import { IPlotRange } from "../i-plot-range";

/**
 * @public
 * Args for {@link TOnEntityRemoved}.
 */
export type TEntityRemovedArgs<TRequiredTraits> = [entity: TEntityTrait<unknown, TRequiredTraits>];

/**
 * @public
 * Listener for entity removed form plot.
 */
export type TOnEntityRemoved<TRequiredTraits> =
    TListener<"onEntityRemoved", TEntityRemovedArgs<TRequiredTraits>>
    ;

/**
 * @public
 * Emitted on entity removed from plot, if the entity is not present this is not emitted.
 */
export class OnEntityRemoved<TRequiredTraits>
    implements TOnEntityRemoved<TRequiredTraits>
{
    public static callbackKey = "onEntityRemoved" as const;

    public constructor
    (
        public onEntityRemoved: (...args: TEntityRemovedArgs<TRequiredTraits>) => void,
    )
    {
    }

    public static registerListener<TRequiredTraits>
    (
        owner: IReadonlyPlot<IPlotRange, TRequiredTraits> | IChartComponent<TUnknownRenderer>,
        onEvent: (...args: TEntityRemovedArgs<TRequiredTraits>) => void,
    )
        : () => void
    {
        return owner.eventService
            .getCategory<"onEntityRemoved", TEntityRemovedArgs<TRequiredTraits>>(OnEntityRemoved)
            .addTemporaryListener(new OnEntityRemoved(onEvent));
    }

    public static registerOneTimeListener<TRequiredTraits>
    (
        owner: IReadonlyPlot<IPlotRange, TRequiredTraits> | IChartComponent<TUnknownRenderer>,
        onEvent: (...args: TEntityRemovedArgs<TRequiredTraits>) => void,
    )
        : () => void
    {
        return owner.eventService
            .getCategory<"onEntityRemoved", TEntityRemovedArgs<TRequiredTraits>>(OnEntityRemoved)
            .addOneTimeListener(new OnEntityRemoved(onEvent));
    }

    public static emit<TRequiredTraits>
    (
        eventService: IEventService,
        entity: TEntityTrait<unknown, TRequiredTraits>,
    )
        : void
    {
        const listeners = eventService
            .getCategory<"onEntityRemoved", TEntityRemovedArgs<TRequiredTraits>>(OnEntityRemoved)
            .getTargets();

        for (let i = 0, iEnd = listeners.length; i < iEnd; ++i)
        {
            listeners[i].onEntityRemoved(entity);
        }
    }
}