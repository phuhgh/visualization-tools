import { IPlotEventTargetProvider } from "../../eventing/user-interaction/i-plot-event-target-provider";
import { IReadonlyPlot } from "../i-plot";
import { IEventService } from "../../eventing/event-service";
import { ICanvasDimensions } from "../../templating/canvas-dimensions";
import { TGetChartEventTargetProviders } from "./t-get-chart-event-target-providers";
import { TInitialChartStateFactory } from "./t-initial-chart-state-factory";
import { IPlotRange } from "../i-plot-range";

/**
 * @public
 */
export interface IPlotInteractionConnector<TPlotRange extends IPlotRange>
{
    register<TTargets extends object>
    (
        plot: IReadonlyPlot<TPlotRange, unknown>,
        chartEventService: IEventService,
        getTargetProviders: TGetChartEventTargetProviders<TTargets>,
        getInitialState: TInitialChartStateFactory<TPlotRange, TTargets>,
    )
        : IPlotEventTargetProvider<TTargets>;

    unregister(chartEventService: IEventService): void;

    update
    (
        canvasDims: ICanvasDimensions,
        startTime: number,
    )
        : IterableIterator<void>;
}