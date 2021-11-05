import { TUnknownRenderer } from "../rendering/t-unknown-renderer";
import { IEventCategoryCtor } from "./event-service";
import { _Array } from "rc-js-util";
import { ChartComponent } from "../chart/chart-component";

/**
 * @public
 * Emits the event on the chart and all connected plots.
 *
 * @remarks
 * Has a higher overhead due to arg spreading so shouldn't be used in performance critical sections.
 */
export function emitToAll<TKey extends string, TArgs extends unknown[]>
(
    chart: ChartComponent<TUnknownRenderer>,
    event: IEventCategoryCtor<TKey, TArgs>,
    ...args: TArgs
)
    : void
{
    chart.eventService
        .getCategory(event)
        .emit(...args);

    _Array.forEach(chart.getPlots(), (plot) =>
    {
        plot.eventService
            .getCategory(event)
            .emit(...args);
    });
}