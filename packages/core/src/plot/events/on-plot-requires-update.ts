import { TListener } from "rc-js-util";
import { IEventService } from "../../eventing/event-service";
import { IReadonlyPlot } from "../i-plot";
import { Plot } from "../plot";
import { EEntityUpdateFlag } from "../../update/e-entity-update-flag";

/**
 * @public
 * Plot requires update/redraw listener.
 */
export type TOnPlotRequiresUpdate = TListener<"onPlotRequiresUpdate", [plot: IReadonlyPlot<unknown, unknown>, updateFlag: EEntityUpdateFlag]>;

/**
 * @public
 * Used to indicate that a redraw is required, which is performed by {@link IChartComponent.updateOnNextFrame}. Multiple
 * calls will be rolled up into a single update.
 */
export class OnPlotRequiresUpdate implements TOnPlotRequiresUpdate
{
    public static callbackKey = "onPlotRequiresUpdate" as const;

    public constructor
    (
        public onPlotRequiresUpdate: (plot: IReadonlyPlot<unknown, unknown>, updateFlag: EEntityUpdateFlag) => void,
    )
    {
    }

    public static registerListener
    (
        eventService: IEventService,
        onEvent: (plot: IReadonlyPlot<unknown, unknown>, updateFlag: EEntityUpdateFlag) => void,
    )
        : () => void
    {
        return eventService
            .getCategory(OnPlotRequiresUpdate)
            .addTemporaryListener(new OnPlotRequiresUpdate(onEvent));
    }

    public static emit
    (
        plot: IReadonlyPlot<unknown, unknown>,
        updateFlag: EEntityUpdateFlag,
    )
        : void
    {
        const listeners = Plot
            .getChartEventService(plot)
            .getCategory(OnPlotRequiresUpdate)
            .getTargets();

        for (let i = 0, iEnd = listeners.length; i < iEnd; ++i)
        {
            listeners[i].onPlotRequiresUpdate(plot, updateFlag);
        }
    }
}
