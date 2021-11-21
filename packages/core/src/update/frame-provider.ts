import { IReadonlyPlot } from "../plot/i-plot";
import { IInteractionHandlerUpdater, InteractionHandlerUpdater } from "./interaction-handler-updater";
import { IPlotRange } from "../plot/i-plot-range";

/**
 * @public
 * Handles rollup of draw calls and incremental updating of interaction handlers.
 */
export interface IFrameProvider
{
    updateOnNextFrame(plot: IReadonlyPlot<IPlotRange, unknown>, updateInteractionHandler: boolean): void;
}

/**
 * @public
 * {@inheritDoc IFrameProvider}
 */
export class FrameProvider implements IFrameProvider
{
    public constructor
    (
        private readonly drawCallback: (plot: IReadonlyPlot<IPlotRange, unknown>) => void,
        private readonly updateInteractionHandlersCallback: (plot: IReadonlyPlot<IPlotRange, unknown>) => IterableIterator<void>,
        rollupTime: number,
        private readonly $window: Window = window,
    )
    {
        this.interactionStateUpdater = new InteractionHandlerUpdater(this.updateInteractionHandlersCallback, rollupTime);
    }

    public updateOnNextFrame(plot: IReadonlyPlot<IPlotRange, unknown>, updateInteractionHandler: boolean): void
    {
        this.plotsToUpdate.add(plot);

        if (updateInteractionHandler)
        {
            this.interactionHandlersToUpdate.add(plot);
        }

        if (this.nextFrame == null)
        {
            this.nextFrame = this.$window.requestAnimationFrame(this.onRafCallback);
        }
    }

    public cancelNextFrame(): void
    {
        if (this.nextFrame == null)
        {
            return;
        }

        this.$window.cancelAnimationFrame(this.nextFrame);
        this.nextFrame = null;
        this.plotsToUpdate.clear();
        this.interactionHandlersToUpdate.clear();
        this.interactionStateUpdater.cancelAll();
    }

    private onRafCallback = () =>
    {
        const drawCallback = this.drawCallback;
        const interactionHandlersToUpdate = this.interactionHandlersToUpdate;
        const interactionStateUpdater = this.interactionStateUpdater;

        for (const plot of this.plotsToUpdate)
        {
            drawCallback(plot);

            if (interactionHandlersToUpdate.has(plot))
            {
                interactionStateUpdater.addPlotToUpdateQueue(plot);
            }
        }

        this.nextFrame = null;
        this.interactionStateUpdater.updateInteractionHandlers();
        this.plotsToUpdate.clear();
        this.interactionHandlersToUpdate.clear();
    };

    private plotsToUpdate = new Set<IReadonlyPlot<IPlotRange, unknown>>();
    private interactionHandlersToUpdate = new Set<IReadonlyPlot<IPlotRange, unknown>>();
    private nextFrame: number | null = null;
    private readonly interactionStateUpdater: IInteractionHandlerUpdater;
}
