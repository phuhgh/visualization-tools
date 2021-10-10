import { IPlotStateFactories, PlotStateFactories } from "./default-state-machine/plot-state-factories";
import { IInteractionStateChangeCallbacks } from "./i-interaction-state-change-callbacks";
import { IPlotEventTargetProvider } from "./i-plot-event-target-provider";
import { IGraphAttachPoint } from "../../templating/graph-attach-point";

/**
 * @public
 * Providers required by the user interaction state machine.
 */
export interface IPlotInteractionProviders<TPlotRange, TTargets extends object>
{
    callbacks: IInteractionStateChangeCallbacks<unknown>;
    stateFactories: IPlotStateFactories<TPlotRange>;
    eventTargets: IPlotEventTargetProvider<TTargets>;
    attachPoint: IGraphAttachPoint;
}

/**
 * @public
 * {@inheritDoc IPlotInteractionProviders}
 */
export class PlotInteractionProviders<TPlotRange, TTargets extends object>
    implements IPlotInteractionProviders<TPlotRange, TTargets>
{
    public stateFactories = new PlotStateFactories<TPlotRange>();

    public constructor
    (
        public callbacks: IInteractionStateChangeCallbacks<unknown>,
        public eventTargets: IPlotEventTargetProvider<TTargets>,
        public attachPoint: IGraphAttachPoint,
    )
    {
    }
}