import { IInteractionOptions } from "../../eventing/user-interaction/i-interaction-options";
import { IPlotInteractionProviders } from "../../eventing/user-interaction/plot-interaction-providers";
import { IChartState } from "../../eventing/user-interaction/default-state-machine/i-chart-state";

/**
 * @public
 */
export type TInitialChartStateFactory<TPlotRange, TTargets extends object> =
    (
        options: IInteractionOptions,
        stateProviders: IPlotInteractionProviders<TPlotRange, TTargets>,
    )
        => IChartState<TPlotRange>;