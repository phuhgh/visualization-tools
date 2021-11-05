import { IGraphAttachPoint } from "../templating/graph-attach-point";
import { IChartConfig } from "./chart-config";
import { _Iterator, AOnDestroy, DirtyCheckedUniqueCollection, IIdentifierFactory } from "rc-js-util";
import { FrameProvider } from "../update/frame-provider";
import { ICanvasDimensions } from "../templating/canvas-dimensions";
import { IPlot, IReadonlyPlot } from "../plot/i-plot";
import { IChartUpdateOptions } from "../update/i-chart-update-options";
import { OnPlotAttached } from "../plot/events/on-plot-attached";
import { OnPlotDetached } from "../plot/events/on-plot-detached";
import { IEventService } from "../eventing/event-service";
import { OnCanvasResized } from "../templating/events/on-canvas-resized";
import { IContextAdapter } from "../rendering/i-context-adapter";
import { OnPlotRequiresUpdate } from "../plot/events/on-plot-requires-update";
import { OnDprChanged } from "../templating/events/on-dpr-changed";
import { EEntityUpdateFlag } from "../update/e-entity-update-flag";
import { ChartTransformFactory, IChartTransformFactory } from "./chart-transform-factory";
import { TUnknownRenderer } from "../rendering/t-unknown-renderer";
import { OnGraphicsComponentAdded } from "../rendering/events/on-graphics-component-added";
import { OnRendererContextRestored } from "../rendering/events/on-renderer-context-restored";
import { OnRendererContextLost } from "../rendering/events/on-renderer-context-lost";
import { emitToAll } from "../eventing/emit-to-all";

/**
 * @public
 * Root component. Orchestrates updates and events.
 */
export interface IChartComponent<TRenderer extends TUnknownRenderer>
{
    readonly attachPoint: IGraphAttachPoint;
    readonly eventService: IEventService;
    readonly renderer: TRenderer;
    readonly changeIdFactory: IIdentifierFactory;

    /**
     * Interaction handlers will be updated after a timeout defined in {@link IChartConfig.updateOptions}.
     * @param plot - The plot to update.
     * @param updateInteractionHandler - Whether the plot's interaction handler should be updated, default `true`.
     */
    updateOnNextFrame(plot?: IPlot<unknown, unknown>, updateInteractionHandler?: boolean): void;
    cancelNextFrame(): void;
    /**
     * Does not update interaction handlers.
     */
    updateImmediate(plot?: IPlot<unknown, unknown>): void;
    updateInteractionHandlers(plot?: IReadonlyPlot<unknown, unknown>): void;

    /**
     * By default resize is performed on every draw, this can be disabled and controlled manually.
     */
    resize(): ICanvasDimensions;

    addPlot<TPlot extends IPlot<unknown, unknown>>(plot: TPlot): TPlot;
    removePlot(plot: IPlot<unknown, unknown>): void;
    getPlots(): readonly IReadonlyPlot<unknown, unknown>[];

    /**
     * Subsequent calls will return the same object.
     */
    getTransformProvider
    (
        transformsToInitialize: readonly symbol[],
        missIsDebugError?: boolean,
    )
        : IChartTransformFactory<TRenderer["TComponentRenderer"]>;
}

/**
 * @public
 * {@inheritDoc IChartComponent}
 */
export class ChartComponent<TRenderer extends TUnknownRenderer>
    extends AOnDestroy
    implements IChartComponent<TRenderer>
{
    public readonly attachPoint: IGraphAttachPoint;
    public readonly eventService: IEventService;
    public readonly renderer: TRenderer;
    public readonly changeIdFactory: IIdentifierFactory;

    public constructor
    (
        attachPoint: IGraphAttachPoint,
        renderer: TRenderer,
        eventService: IEventService,
        config: IChartConfig,
        contextAdapter: IContextAdapter<unknown>,
        frameProvider?: FrameProvider,
    )
    {
        super();
        this.contextAdapter = contextAdapter;
        this.renderer = renderer;
        this.eventService = eventService;
        this.updateOptions = config.updateOptions;
        this.attachPoint = attachPoint;
        this.changeIdFactory = config.changeIdFactory;
        this.frameProvider = frameProvider ?? this.createDefaultFrameProvider(config);

        this.registerEventHandlers();
    }

    public cancelNextFrame(): void
    {
        this.frameProvider.cancelNextFrame();
    }

    public updateOnNextFrame(plot?: IPlot<unknown, unknown>, updateInteractionHandler: boolean = true): void
    {
        updateInteractionHandler = Boolean(updateInteractionHandler);

        if (plot != null && !this.updateOptions.updateAllPlotsOnDraw)
        {
            this.frameProvider.updateOnNextFrame(plot, updateInteractionHandler);
        }
        else
        {
            const plots = this.plotCollection.getArray();

            for (let i = 0, iEnd = plots.length; i < iEnd; ++i)
            {
                this.frameProvider.updateOnNextFrame(plots[i], updateInteractionHandler);
            }
        }
    }

    public updateImmediate(plot?: IReadonlyPlot<unknown, unknown>): void
    {
        if (this.contextLost)
        {
            return;
        }

        if (this.updateOptions.updateDimsOnDraw)
        {
            this.resize();
        }

        const canvasDims = this.attachPoint.canvasDims;

        if (plot != null)
        {
            if (this.plotCollection.has(plot))
            {
                this.drawPlot(plot, canvasDims);
            }
        }
        else
        {
            const plots = this.plotCollection.getArray();

            for (let i = 0, iEnd = plots.length; i < iEnd; ++i)
            {
                const plot = plots[i];
                this.drawPlot(plot, canvasDims);
            }
        }
    }

    private drawPlot(plot: IReadonlyPlot<unknown, unknown>, canvasDims: ICanvasDimensions): void
    {
        this.renderer.onBeforePlotDraw(plot, canvasDims);
        plot.updateStrategy.update(canvasDims, this.renderer);
        this.renderer.onAfterPlotDraw();
    }

    public updateInteractionHandlers(plot?: IReadonlyPlot<unknown, unknown>): void
    {
        _Iterator.consumeAll(this.updateInteractionHandlersIncremental(plot));
    }

    private * updateInteractionHandlersIncremental(plot?: IReadonlyPlot<unknown, unknown>): IterableIterator<void>
    {
        const startTime = performance.now();
        const canvasDims = this.attachPoint.canvasDims;

        if (plot != null)
        {
            if (this.plotCollection.has(plot))
            {
                const it = ChartComponent.updateInteractionHandler(plot, canvasDims, startTime);
                while (!(it.next().done ?? false))
                {
                    yield;
                }
            }
        }
        else
        {
            const plots = this.plotCollection.getArray();

            for (let i = 0, iEnd = plots.length; i < iEnd; ++i)
            {
                const plot = plots[i];

                if (this.plotCollection.has(plot))
                {
                    const it = ChartComponent.updateInteractionHandler(plot, canvasDims, startTime);
                    while (!(it.next().done ?? false))
                    {
                        yield;
                    }
                }
            }
        }
    }

    public resize(): ICanvasDimensions
    {
        const previousDims = this.attachPoint.canvasDims;
        const canvasDims = this.attachPoint.resizeCanvas();

        if (previousDims == canvasDims)
        {
            // no resize actually happened, don't emit
            return canvasDims;
        }

        this.contextAdapter.onResize(canvasDims);
        OnCanvasResized.emit(this.eventService, canvasDims);

        return canvasDims;
    }

    public addPlot<TPlot extends IPlot<unknown, unknown>>(plot: TPlot): TPlot
    {
        if (this.plotCollection.has(plot))
        {
            return plot;
        }

        this.plotCollection.add(plot);

        this.eventService
            .getCategory(OnCanvasResized)
            .addListener(plot);

        OnPlotAttached.emit(plot, this);

        return plot;
    }

    public removePlot(plot: IPlot<unknown, unknown>): void
    {
        this.eventService
            .getCategory(OnCanvasResized)
            .removeListener(plot);

        plot.clearInteractionHandler();
        this.plotCollection.delete(plot);

        OnPlotDetached.emit(plot, this);
    }

    public getPlots(): readonly IReadonlyPlot<unknown, unknown>[]
    {
        return this.plotCollection.getArray();
    }

    public getTransformProvider
    (
        transformsToInitialize: readonly symbol[],
        missIsDebugError: boolean = false,
    )
        : IChartTransformFactory<TRenderer["TComponentRenderer"]>
    {
        if (this.transformProvider != null)
        {
            return this.transformProvider;
        }

        return this.transformProvider = new ChartTransformFactory(this.renderer, transformsToInitialize, missIsDebugError);
    }

    private static updateInteractionHandler
    (
        plot: IReadonlyPlot<unknown, unknown>,
        canvasDims: ICanvasDimensions,
        startTime: number,
    )
        : IterableIterator<void>
    {
        const interactionHandler = plot.getInteractionHandler();

        return interactionHandler == null
            ? _Iterator.emptyIterator
            : interactionHandler.update(canvasDims, startTime);
    }

    private createDefaultFrameProvider(config: IChartConfig): FrameProvider
    {
        return new FrameProvider(
            (plot) => this.updateImmediate(plot),
            (plot) => this.updateInteractionHandlersIncremental(plot),
            config.updateOptions.interactionRollupTime,
        );
    }

    private registerEventHandlers(): void
    {
        this.contextAdapter.graphContextChangeHooks.registerCallbacks(
            () =>
            {
                this.contextLost = true;
                this.renderer.onContextLost();
                emitToAll(this, OnRendererContextLost);
            },
            () =>
            {
                const context = this.contextAdapter.getContext();

                if (context != null)
                {
                    this.contextLost = false;
                    this.renderer.onContextRegained(context);
                    emitToAll(this, OnRendererContextRestored);
                }
            },
        );

        // local listeners
        OnPlotRequiresUpdate.registerListener(this.eventService, (plot, updateFlag) =>
        {
            const updateInteractionHandler = (updateFlag & EEntityUpdateFlag.InteractionHandlerUpdateRequired) !== 0;

            if (updateFlag & EEntityUpdateFlag.DrawRequired)
            {
                this.frameProvider.updateOnNextFrame(plot, updateInteractionHandler);

            }
            else if (updateInteractionHandler)
            {
                // FIXME do this with yielding option
                this.updateInteractionHandlers(plot);
            }
        });

        // events to proxy to plots
        OnCanvasResized.registerListener(this.eventService, (canvasDims) =>
        {
            const plots = this.plotCollection.getArray();
            const emit = OnCanvasResized.emit;

            for (let i = 0, iEnd = plots.length; i < iEnd; ++i)
            {
                emit(plots[i].eventService, canvasDims);
            }
        });

        OnDprChanged.registerListener(this.eventService, (dpr) =>
        {
            const plots = this.plotCollection.getArray();
            const emit = OnDprChanged.emit;

            for (let i = 0, iEnd = plots.length; i < iEnd; ++i)
            {
                emit(plots[i].eventService, dpr);
            }
        });

        OnGraphicsComponentAdded.registerListener(this.eventService, (graphicsComponent) =>
        {
            if (this.transformProvider != null)
            {
                this.transformProvider.initializeTransformComponent(graphicsComponent);
            }
        });
    }

    protected readonly frameProvider: FrameProvider;
    protected readonly contextAdapter: IContextAdapter<unknown>;
    protected readonly updateOptions: IChartUpdateOptions;
    protected readonly plotCollection = new DirtyCheckedUniqueCollection<IReadonlyPlot<unknown, unknown>>();
    private transformProvider: ChartTransformFactory<TRenderer["TComponentRenderer"]> | null = null;
    protected contextLost = false;
}

