import { IPlotEventTargetProvider } from "../../eventing/user-interaction/i-plot-event-target-provider";

/**
 * @public
 */
export type TGetChartEventTargetProviders<TTargets extends object> = () => IPlotEventTargetProvider<TTargets>;