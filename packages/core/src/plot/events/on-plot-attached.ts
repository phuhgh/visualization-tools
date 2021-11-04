import { IChartComponent } from "../../chart/chart-component";
import { IReadonlyPlot } from "../i-plot";
import { TListener } from "rc-js-util";
import { TUnknownRenderer } from "../../rendering/t-unknown-renderer";

/**
 * @public
 * Listener for plot attach to chart.
 */
export type TOnPlotAttached<TRenderer extends TUnknownRenderer> = TListener<"onPlotAttached", [IChartComponent<TRenderer>]>;

/**
 * @public
 * Emitted on plot attaching to chart.
 */
export class OnPlotAttached<TRenderer extends TUnknownRenderer>
    implements TOnPlotAttached<TRenderer>
{
    public static callbackKey = "onPlotAttached" as const;

    public constructor
    (
        public onPlotAttached: (chart: IChartComponent<TRenderer>) => void,
    )
    {
    }

    public static registerListener
    (
        plot: IReadonlyPlot<unknown, unknown>,
        onEvent: (chart: IChartComponent<TUnknownRenderer>) => void,
    )
        : () => void
    {
        return plot.eventService
            .getCategory(OnPlotAttached)
            .addTemporaryListener(new OnPlotAttached(onEvent));
    }

    public static emit
    (
        plot: IReadonlyPlot<unknown, unknown>,
        chart: IChartComponent<TUnknownRenderer>,
    )
        : void
    {
        const listeners = plot.eventService
            .getCategory(OnPlotAttached)
            .getTargets();

        for (let i = 0, iEnd = listeners.length; i < iEnd; ++i)
        {
            listeners[i].onPlotAttached(chart);
        }
    }
}