import { IChartComponent } from "../../chart/chart-component";
import { IReadonlyPlot } from "../i-plot";
import { TListener } from "rc-js-util";
import { TUnknownEntityRenderer } from "../../rendering/t-unknown-entity-renderer";

/**
 * @public
 * Listener for plot attach to chart.
 */
export type TOnPlotAttached<TEntityRenderer extends TUnknownEntityRenderer> = TListener<"onPlotAttached", [IChartComponent<TEntityRenderer>]>;

/**
 * @public
 * Emitted on plot attaching to chart.
 */
export class OnPlotAttached<TEntityRenderer extends TUnknownEntityRenderer>
    implements TOnPlotAttached<TEntityRenderer>
{
    public static callbackKey = "onPlotAttached" as const;

    public constructor
    (
        public onPlotAttached: (chart: IChartComponent<TEntityRenderer>) => void,
    )
    {
    }

    public static registerListener
    (
        plot: IReadonlyPlot<unknown, unknown>,
        onEvent: (chart: IChartComponent<TUnknownEntityRenderer>) => void,
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
        chart: IChartComponent<TUnknownEntityRenderer>,
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