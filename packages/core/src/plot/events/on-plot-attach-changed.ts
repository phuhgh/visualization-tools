import { IChartComponent } from "../../chart/chart-component";
import { IReadonlyPlot } from "../i-plot";
import { TListener } from "rc-js-util";
import { TUnknownRenderer } from "../../rendering/t-unknown-renderer";

/**
 * @public
 * Args for {@link OnPlotAttachChanged}.
 */
export type TOnPlotAttachChangedArgs<TRenderer extends TUnknownRenderer> = [isAttached: boolean, chart: IChartComponent<TRenderer>];

/**
 * @public
 * Listener for plot attach / detach to chart.
 */
export type TOnPlotAttachChanged<TRenderer extends TUnknownRenderer> = TListener<"onPlotAttachChanged", TOnPlotAttachChangedArgs<TRenderer>>;

/**
 * @public
 * Emitted on plot attaching or detaching from chart.
 */
export class OnPlotAttachChanged<TRenderer extends TUnknownRenderer>
    implements TOnPlotAttachChanged<TRenderer>
{
    public static callbackKey = "onPlotAttachChanged" as const;

    public constructor
    (
        public onPlotAttachChanged: (...args: TOnPlotAttachChangedArgs<TRenderer>) => void,
    )
    {
    }

    public static registerListener
    (
        plot: IReadonlyPlot<unknown, unknown>,
        onEvent: (...args: TOnPlotAttachChangedArgs<TUnknownRenderer>) => void,
    )
        : () => void
    {
        return plot.eventService
            .getCategory(OnPlotAttachChanged)
            .addTemporaryListener(new OnPlotAttachChanged(onEvent));
    }

    public static registerOneTimeListener<TRenderer extends TUnknownRenderer, TPlotRange>
    (
        plot: IReadonlyPlot<TPlotRange, unknown>,
        onEvent: (...args: TOnPlotAttachChangedArgs<TRenderer>) => void,
    )
        : () => void
    {
        return plot.eventService
            .getCategory<"onPlotAttachChanged", TOnPlotAttachChangedArgs<TRenderer>>(OnPlotAttachChanged)
            .addOneTimeListener(new OnPlotAttachChanged(onEvent));
    }

    public static emit
    (
        plot: IReadonlyPlot<unknown, unknown>,
        chart: IChartComponent<TUnknownRenderer>,
        isAttached: boolean,
    )
        : void
    {
        const listeners = plot.eventService
            .getCategory(OnPlotAttachChanged)
            .getTargets();

        for (let i = 0, iEnd = listeners.length; i < iEnd; ++i)
        {
            listeners[i].onPlotAttachChanged(isAttached, chart);
        }
    }
}