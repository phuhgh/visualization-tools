import { IChartComponent } from "../../chart/chart-component";
import { IReadonlyPlot } from "../i-plot";
import { TListener } from "rc-js-util";
import { TUnknownEntityRenderer } from "../../rendering/t-unknown-entity-renderer";

/**
 * @public
 * Args for {@link TOnPlotDetached}.
 */
export type TOnPlotDetachedArgs<TEntityRenderer extends TUnknownEntityRenderer> = [chart: IChartComponent<TEntityRenderer>];

/**
 * @public
 * Listener for plot detaching from chart.
 */
export type TOnPlotDetached<TEntityRenderer extends TUnknownEntityRenderer> = TListener<"onPlotDetached", TOnPlotDetachedArgs<TEntityRenderer>>;

/**
 * @public
 * Emitted on plot being removed from {@link IChartComponent}.
 */
export class OnPlotDetached<TEntityRenderer extends TUnknownEntityRenderer> implements TOnPlotDetached<TEntityRenderer>
{
    public static callbackKey = "onPlotDetached" as const;

    public constructor
    (
        public onPlotDetached: (...args: TOnPlotDetachedArgs<TEntityRenderer>) => void,
    )
    {
    }

    public static registerListener<TEntityRenderer extends TUnknownEntityRenderer, TPlotRange>
    (
        plot: IReadonlyPlot<TPlotRange, unknown>,
        onEvent: (chart: IChartComponent<TEntityRenderer>) => void,
    )
        : () => void
    {
        return plot.eventService
            .getCategory<"onPlotDetached", TOnPlotDetachedArgs<TEntityRenderer>>(OnPlotDetached)
            .addTemporaryListener(new OnPlotDetached(onEvent));
    }

    public static registerOneTimeListener<TEntityRenderer extends TUnknownEntityRenderer, TPlotRange>
    (
        plot: IReadonlyPlot<TPlotRange, unknown>,
        onEvent: (chart: IChartComponent<TEntityRenderer>) => void,
    )
        : () => void
    {
        return plot.eventService
            .getCategory<"onPlotDetached", TOnPlotDetachedArgs<TEntityRenderer>>(OnPlotDetached)
            .addOneTimeListener(new OnPlotDetached(onEvent));
    }

    public static emit<TEntityRenderer extends TUnknownEntityRenderer, TPlotRange>
    (
        plot: IReadonlyPlot<TPlotRange, unknown>,
        chart: IChartComponent<TEntityRenderer>,
    )
        : void
    {
        const listeners = plot.eventService
            .getCategory<"onPlotDetached", TOnPlotDetachedArgs<TEntityRenderer>>(OnPlotDetached)
            .getTargets();

        for (let i = 0, iEnd = listeners.length; i < iEnd; ++i)
        {
            listeners[i].onPlotDetached(chart);
        }
    }
}