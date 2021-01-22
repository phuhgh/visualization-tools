import { _Fp, IIncrementallyUpdatable, IncrementalUpdater, TDebouncedFn } from "rc-js-util";
import { IReadonlyPlot } from "../plot/i-plot";

/**
 * @internal
 */
export interface IInteractionHandlerUpdater
{
    cancelAll(): void;
    addPlotToUpdateQueue(plot: IReadonlyPlot<unknown, unknown>): void;
    updateInteractionHandlers(): void;
}

/**
 * @internal
 */
export class InteractionHandlerUpdater
    implements IInteractionHandlerUpdater,
               IIncrementallyUpdatable
{
    public constructor
    (
        private readonly updateInteractionHandlersCallback: (plot: IReadonlyPlot<unknown, unknown>) => IterableIterator<void>,
        private readonly rollupTime: number,
    )
    {
    }

    public addPlotToUpdateQueue(plot: IReadonlyPlot<unknown, unknown>): void
    {
        if (this.incrementalUpdater.isUpdating)
        {
            this.plotsToUpdate.delete(plot);
            this.nextPlotsToUpdate.add(plot);
        }
        else
        {
            this.plotsToUpdate.add(plot);
        }
    }

    public updateInteractionHandlers(): void
    {
        if (this.incrementalUpdater.isUpdating)
        {
            this.incrementalUpdater.suspend();
        }

        this.updateInteractionHandlersImpl();
    }

    private updateInteractionHandlersImpl: TDebouncedFn<[]> = _Fp.debounce(this.rollupTime, false, () =>
    {
        if (this.incrementalUpdater.isUpdating)
        {
            this.incrementalUpdater.resume();
        }
        else
        {
            this.incrementalUpdater.beginUpdate();
        }
    });

    public cancelAll(): void
    {
        this.plotsToUpdate.clear();
        this.nextPlotsToUpdate.clear();
        this.incrementalUpdater.cancel();
    }

    public * incrementallyUpdate(): IterableIterator<void>
    {
        while (true)
        {
            for (const plot of this.plotsToUpdate)
            {
                const it = this.updateInteractionHandlersCallback(plot);

                while (!(it.next().done ?? false))
                {
                    yield;

                    if (!this.plotsToUpdate.has(plot))
                    {
                        break;
                    }
                }
            }

            if (this.nextPlotsToUpdate.size === 0)
            {
                break;
            }
            else
            {
                this.swap();
            }
        }

        this.plotsToUpdate.clear();
    }

    private swap(): void
    {
        const tmp = this.plotsToUpdate;
        this.plotsToUpdate = this.nextPlotsToUpdate;
        this.nextPlotsToUpdate = tmp;
        this.nextPlotsToUpdate.clear();
    }

    private incrementalUpdater = new IncrementalUpdater(this);
    private plotsToUpdate = new Set<IReadonlyPlot<unknown, unknown>>();
    private nextPlotsToUpdate = new Set<IReadonlyPlot<unknown, unknown>>();
}
