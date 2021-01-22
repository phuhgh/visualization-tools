import { IInteractionOptions } from "../i-interaction-options";
import { IPlotInteractionProviders } from "../plot-interaction-providers";
import { IdleState } from "./idle-state";
import { IDefaultTargets } from "../hit-test/i-default-targets";
import { DefaultInteractionSharedState } from "../default-interaction-shared-state";

/**
 * @public
 * Provides user interaction state machine initial state.
 */
export function getChartInitialState<TPlotRange>
(
    options: IInteractionOptions,
    stateProviders: IPlotInteractionProviders<TPlotRange, IDefaultTargets>,
)
    : IdleState<TPlotRange>
{
    return new IdleState(
        null,
        options,
        stateProviders,
        new DefaultInteractionSharedState(stateProviders),
    );
}