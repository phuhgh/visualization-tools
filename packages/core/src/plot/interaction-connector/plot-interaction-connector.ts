import { IChartState } from "../../eventing/user-interaction/default-state-machine/i-chart-state";
import { IInteractionStateChangeCallbacks } from "../../eventing/user-interaction/i-interaction-state-change-callbacks";
import { PlotInteractionProviders } from "../../eventing/user-interaction/plot-interaction-providers";
import { IInteractionOptions } from "../../eventing/user-interaction/i-interaction-options";
import { IPlotEventTargetProvider } from "../../eventing/user-interaction/hit-test/i-plot-event-target-provider";
import { PlotEventHandler } from "../../eventing/user-interaction/plot-event-handler";
import { IPlotInteractionConnector } from "./i-plot-interaction-connector";
import { IReadonlyPlot } from "../i-plot";
import { OnCanvasMouseEvent, TOnCanvasMouseEvent } from "../../eventing/events/on-canvas-mouse-event";
import { OnCanvasPointerEvent, TOnCanvasPointerEvent } from "../../eventing/events/on-canvas-pointer-event";
import { OnCanvasResized, TOnCanvasResized } from "../../eventing/events/on-canvas-resized";
import { IEventService } from "../../eventing/chart-event-service";
import { ICanvasDimensions } from "../../templating/canvas-dimensions";
import { TGetChartEventTargetProviders } from "./t-get-chart-event-target-providers";
import { TInitialChartStateFactory } from "./t-initial-chart-state-factory";
import { _Iterator, TemporaryListener } from "rc-js-util";

/**
 * @public
 */
export type TAttachPointListeners =
    & TOnCanvasMouseEvent
    & TOnCanvasPointerEvent
    & TOnCanvasResized
    ;

/**
 * @public
 */
export type TChartEventHandlerProvider<TPlotRange> = (initialState: IChartState<TPlotRange>, plot: IReadonlyPlot<TPlotRange, unknown>) => TAttachPointListeners;

/**
 * @public
 * Provides a reasonably generic attach point for behaviors on events. A default state machine will be supplied which
 * provides both mouse and touch events for: click, double click, pinch and mouse zooming, dragging and entity hover.
 *
 * @remarks
 * The default state machine can be extended by providing supplying a custom initial state, pointing to the extension.
 */
export class PlotInteractionConnector<TPlotRange>
    implements IPlotInteractionConnector<TPlotRange>
{
    public constructor
    (
        private readonly stateChangeCallbacks: (stateProviders: IPlotEventTargetProvider<object>) => IInteractionStateChangeCallbacks<unknown>,
        private readonly options: IInteractionOptions = { doubleClickOptions: { timeout: 500, maxRadius: 2 }, pinchZoomSensitivity: 1 },
        private readonly createEventHandler: TChartEventHandlerProvider<TPlotRange> = (initialState, plot) => new PlotEventHandler<TPlotRange>(initialState, plot),
    )
    {
    }

    public register<TTargets extends object>
    (
        plot: IReadonlyPlot<TPlotRange, unknown>,
        chartEventService: IEventService,
        getTargetProviders: TGetChartEventTargetProviders<TTargets>,
        getInitialState: TInitialChartStateFactory<TPlotRange, TTargets>,
    )
        : IPlotEventTargetProvider<TTargets>
    {
        this.unregister();
        const targetProvider = this.targetProvider = getTargetProviders();
        this.userCallbacks = this.stateChangeCallbacks(targetProvider);
        const initialState = getInitialState(this.options, new PlotInteractionProviders<TPlotRange, TTargets>(
                this.userCallbacks,
                targetProvider,
                plot.attachPoint,
            ),
        );
        this.eventHandler = this.createEventHandler(initialState, plot);

        this.temporaryListeners.addListener(chartEventService.getCategory(OnCanvasResized).addTemporaryListener(this.userCallbacks));
        this.temporaryListeners.addListener(chartEventService.getCategory(OnCanvasResized).addTemporaryListener(this.eventHandler));
        this.temporaryListeners.addListener(chartEventService.getCategory(OnCanvasMouseEvent).addTemporaryListener(this.eventHandler));
        this.temporaryListeners.addListener(chartEventService.getCategory(OnCanvasPointerEvent).addTemporaryListener(this.eventHandler));

        return targetProvider;
    }

    public unregister(): void
    {
        this.temporaryListeners.clearingEmit();
        this.eventHandler = null;
        this.userCallbacks = null;
    }

    public update(canvasDims: ICanvasDimensions, startTime: number): IterableIterator<void>
    {
        return this.targetProvider == null
            ? _Iterator.emptyIterator
            : this.targetProvider.update(canvasDims, startTime);
    }

    private eventHandler: TAttachPointListeners | null = null;
    private userCallbacks: IInteractionStateChangeCallbacks<unknown> | null = null;
    private targetProvider: IPlotEventTargetProvider<object> | null = null;
    private temporaryListeners = new TemporaryListener();
}
