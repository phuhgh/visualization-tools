import { IGraphAttachPointProvider } from "./graph-attach-point-provider";
import { _Debug, AOnDestroy, IDictionary, Range2d } from "rc-js-util";
import { EMouseEventType } from "../eventing/user-interaction/internal-events/e-mouse-event-type";
import { EPointerEventType } from "../eventing/user-interaction/internal-events/e-pointer-event-type";
import { CanvasDimensions, ICanvasDimensions } from "./canvas-dimensions";
import { EventService } from "../eventing/event-service";
import { OnCanvasPointerEvent } from "./events/on-canvas-pointer-event";
import { OnCanvasMouseEvent } from "./events/on-canvas-mouse-event";
import { IChartConfig } from "../chart/chart-config";
import { OnDprChanged } from "./events/on-dpr-changed";

/**
 * @public
 * Wrapper of DOM element that contains the chart, houses hidden canvases as required.
 */
export interface IGraphAttachPoint
{
    readonly canvasDims: ICanvasDimensions;
    readonly hiddenElement: HTMLDivElement;
    readonly canvasElement: HTMLCanvasElement;

    /**
     * Synchronizes the canvas' actual size with the size set by attribute.
     * Returns the updated size in both css and actual pixels.
     *
     * Do not call directly, call resize on the chart.
     */
    resizeCanvas(): ICanvasDimensions;
    addHiddenElement<TKey extends keyof HTMLElementTagNameMap>(className: string, tagName: TKey): HTMLElementTagNameMap[TKey];
    removeHiddenElement(className: string): void;
}

/**
 * @public
 * {@inheritDoc IGraphAttachPoint}
 */
export class GraphAttachPoint
    extends AOnDestroy
    implements IGraphAttachPoint
{
    public canvasDims = CanvasDimensions.createDefault();
    public readonly chartWrapper: HTMLElement;
    public readonly hiddenElement: HTMLDivElement;
    public readonly canvasElement: HTMLCanvasElement;

    public constructor
    (
        attachPointProvider: IGraphAttachPointProvider,
        private readonly chartEventService: EventService,
        private readonly chartConfig: IChartConfig,
        private readonly $window: Window = window,
    )
    {
        super();
        this.chartWrapper = attachPointProvider.getWrapperElement();
        this.hiddenElement = attachPointProvider.getHiddenElement();
        this.canvasElement = attachPointProvider.getCanvasElement();
        this.registerEventHandlers();
    }

    public resizeCanvas(): ICanvasDimensions
    {
        DEBUG_MODE && _Debug.assert(this.canvasElement.clientWidth > 0 && this.canvasElement.clientHeight > 0, "probably resized while off screen");

        const w = this.canvasElement.clientWidth | 0;
        const h = this.canvasElement.clientHeight | 0;

        if (this.canvasDims.cssDims.getXMax() === w && this.canvasDims.cssDims.getYMax() === h)
        {
            return this.canvasDims;
        }

        // update dims
        const dpr = this.$window.devicePixelRatio;
        const boundingRect = this.canvasElement.getBoundingClientRect();
        this.canvasDims = new CanvasDimensions(
            dpr,
            Range2d.f32.factory.createOne(
                0,
                w | 0,
                0,
                h | 0,
            ),
            Range2d.f32.factory.createOne(
                0,
                (w * dpr) | 0,
                0,
                (h * dpr) | 0,
            ),
            Range2d.f32.factory.createOne(boundingRect.left, boundingRect.right, boundingRect.top, boundingRect.bottom),
        );

        // synchronize the canvas' dimensions to the css size
        this.canvasElement.width = this.canvasDims.pixelDims.getXRange();
        this.canvasElement.height = this.canvasDims.pixelDims.getYRange();

        return this.canvasDims;
    }

    public addHiddenElement<TKey extends keyof HTMLElementTagNameMap>(className: string, tagName: TKey): HTMLElementTagNameMap[TKey]
    {
        const storedElement = this.hiddenElements[className];

        if (storedElement != null)
        {
            return storedElement as HTMLElementTagNameMap[TKey];
        }
        else
        {
            const element = this.hiddenElements[className] = this.$window.document.createElement(tagName);
            element.classList.add(className);
            this.hiddenElement.appendChild(element);

            return element;
        }
    }

    public removeHiddenElement(className: string): void
    {
        const element = this.hiddenElement.getElementsByClassName(className)[0];

        if (element == null)
        {
            return;
        }

        this.hiddenElement.removeChild(element);
    }

    protected registerEventHandlers(): void
    {
        if (this.chartConfig.interactionOptions.disableAllInteraction)
        {
            return;
        }

        this.onDestroyListener.initializeListener(() =>
        {
            const options: AddEventListenerOptions = { once: true, passive: true };
            let mq = matchMedia(`(resolution: ${this.$window.devicePixelRatio}dppx)`);

            const emitEvent = () =>
            {
                const dpr = this.$window.devicePixelRatio;
                mq = matchMedia(`(resolution: ${dpr}dppx)`);
                mq.addEventListener("change", emitEvent, options);
                OnDprChanged.emit(this.chartEventService, dpr);
            };

            mq.addEventListener("change", emitEvent, options);

            return () => mq.removeEventListener("change", emitEvent);
        });

        // mouse events
        if (this.chartConfig.interactionOptions.scrollZooms)
        {
            this.onDestroyListener.initializeListener(() =>
            {
                const onEvent = ($event: WheelEvent) =>
                {
                    $event.stopPropagation();
                    $event.preventDefault();
                    OnCanvasMouseEvent.emit(this.chartEventService, EMouseEventType.Wheel, $event);
                };

                this.chartConfig.changeDetectionConfig.runOutsideOfChangeDetection(() =>
                {
                    this.canvasElement.addEventListener("wheel", onEvent, { passive: false });
                });

                return () => this.canvasElement.removeEventListener("wheel", onEvent);
            });
        }

        if (this.chartConfig.interactionOptions.disableLongPressContext)
        {
            this.onDestroyListener.initializeListener(() =>
            {
                const onEvent = ($event: MouseEvent) =>
                {
                    $event.stopPropagation();
                    $event.preventDefault();
                };

                this.chartConfig.changeDetectionConfig.runOutsideOfChangeDetection(() =>
                {
                    this.canvasElement.addEventListener("contextmenu", onEvent, { passive: false });
                });

                return () => this.canvasElement.removeEventListener("contextmenu", onEvent);
            });
        }

        // pointer events
        this.onDestroyListener.initializeListener(() =>
        {
            const onEvent = ($event: PointerEvent) => OnCanvasPointerEvent.emit(this.chartEventService, EPointerEventType.Out, $event);

            this.chartConfig.changeDetectionConfig.runOutsideOfChangeDetection(() =>
            {
                this.canvasElement.addEventListener("pointerout", onEvent, { passive: true });
            });

            return () => this.canvasElement.removeEventListener("pointerout", onEvent);
        });

        this.onDestroyListener.initializeListener(() =>
        {
            const onEvent = ($event: PointerEvent) => OnCanvasPointerEvent.emit(this.chartEventService, EPointerEventType.Down, $event);

            this.chartConfig.changeDetectionConfig.runOutsideOfChangeDetection(() =>
            {
                this.canvasElement.addEventListener("pointerdown", onEvent, { passive: true });
            });

            return () => this.canvasElement.removeEventListener("pointerdown", onEvent);
        });

        this.onDestroyListener.initializeListener(() =>
        {
            const onEvent = ($event: PointerEvent) => OnCanvasPointerEvent.emit(this.chartEventService, EPointerEventType.Up, $event);

            this.chartConfig.changeDetectionConfig.runOutsideOfChangeDetection(() =>
            {
                this.canvasElement.addEventListener("pointerup", onEvent, { passive: true });
            });

            return () => this.canvasElement.removeEventListener("pointerup", onEvent);
        });

        this.onDestroyListener.initializeListener(() =>
        {
            const onEvent = ($event: PointerEvent) => OnCanvasPointerEvent.emit(this.chartEventService, EPointerEventType.Move, $event);

            this.chartConfig.changeDetectionConfig.runOutsideOfChangeDetection(() =>
            {
                this.canvasElement.addEventListener("pointermove", onEvent, { passive: true });
            });

            return () => this.canvasElement.removeEventListener("pointermove", onEvent);
        });
    }

    private hiddenElements: IDictionary<Element | undefined> = {};
}