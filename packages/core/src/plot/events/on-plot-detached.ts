import { IChartComponent } from "../../chart/chart-component";
import { IReadonlyPlot } from "../i-plot";
import { TListener } from "rc-js-util";
import { TUnknownRenderer } from "../../rendering/t-unknown-renderer";

/**
 * @public
 * Args for {@link TOnPlotDetached}.
 */
export type TOnPlotDetachedArgs<TRenderer extends TUnknownRenderer> = [chart: IChartComponent<TRenderer>];

/**
 * @public
 * Listener for plot detaching from chart.
 */
export type TOnPlotDetached<TRenderer extends TUnknownRenderer> = TListener<"onPlotDetached", TOnPlotDetachedArgs<TRenderer>>;

/**
 * @public
 * Emitted on plot being removed from {@link IChartComponent}.
 */
export class OnPlotDetached<TRenderer extends TUnknownRenderer> implements TOnPlotDetached<TRenderer>
{
    public static callbackKey = "onPlotDetached" as const;

    public constructor
    (
        public onPlotDetached: (...args: TOnPlotDetachedArgs<TRenderer>) => void,
    )
    {
    }

    public static registerListener<TRenderer extends TUnknownRenderer, TPlotRange>
    (
        plot: IReadonlyPlot<TPlotRange, unknown>,
        onEvent: (chart: IChartComponent<TUnknownRenderer>) => void,
    )
        : () => void
    {
        return plot.eventService
            .getCategory<"onPlotDetached", TOnPlotDetachedArgs<TRenderer>>(OnPlotDetached)
            .addTemporaryListener(new OnPlotDetached(onEvent));
    }

    public static registerOneTimeListener<TRenderer extends TUnknownRenderer, TPlotRange>
    (
        plot: IReadonlyPlot<TPlotRange, unknown>,
        onEvent: (chart: IChartComponent<TUnknownRenderer>) => void,
    )
        : () => void
    {
        return plot.eventService
            .getCategory<"onPlotDetached", TOnPlotDetachedArgs<TRenderer>>(OnPlotDetached)
            .addOneTimeListener(new OnPlotDetached(onEvent));
    }

    public static emit<TRenderer extends TUnknownRenderer, TPlotRange>
    (
        plot: IReadonlyPlot<TPlotRange, unknown>,
        chart: IChartComponent<TRenderer>,
    )
        : void
    {
        const listeners = plot.eventService
            .getCategory<"onPlotDetached", TOnPlotDetachedArgs<TRenderer>>(OnPlotDetached)
            .getTargets();

        for (let i = 0, iEnd = listeners.length; i < iEnd; ++i)
        {
            listeners[i].onPlotDetached(chart);
        }
    }
}