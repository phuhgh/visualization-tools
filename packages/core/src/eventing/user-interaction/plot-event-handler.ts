import { IChartState } from "./default-state-machine/i-chart-state";
import { EPointerEventType, EPointerEventTypeNames } from "./internal-events/e-pointer-event-type";
import { _Debug } from "rc-js-util";
import { EMouseEventType, EMouseEventTypeNames } from "./internal-events/e-mouse-event-type";
import { IPointerEventProvider, PointerEventProvider } from "./internal-events/pointer-event-provider";
import { ChartPointerEvent } from "./internal-events/chart-pointer-event";
import { ICanvasDimensions } from "../../templating/canvas-dimensions";
import { IReadonlyPlot } from "../../plot/i-plot";
import { TAttachPointListeners } from "../../plot/interaction-connector/plot-interaction-connector";

/**
 * @internal
 */
export class PlotEventHandler<TPlotRange>
    implements TAttachPointListeners
{
    public constructor
    (
        initialState: IChartState<TPlotRange>,
        private readonly plot: IReadonlyPlot<TPlotRange, unknown>,
    )
    {
        this.currentState = initialState;
        this.pointerEventProvider = new PointerEventProvider(plot.attachPoint);
    }

    public onCanvasResized(canvasDims: ICanvasDimensions): void
    {
        this.pointerEventProvider.setCanvasDims(canvasDims);
    }

    public onPointerEvent(eventType: EPointerEventType, $event: PointerEvent): void
    {
        this.pointerEventProvider.updatePointerEvent($event, this.pointerEvent);

        if (!this.plot.plotDimensionsOBL.clipSpaceArea.interactiveRange.isPointInRange(this.pointerEvent.pointerClipPosition))
        {
            // it's outside of the plot's range, act as if it's an out event
            eventType = EPointerEventType.Out;
        }

        const newState = this.currentState.handlePointerEvent(eventType, this.pointerEvent);

        if (newState != null)
        {
            DEBUG_MODE && _Debug.runBlock(() =>
            {
                const prevState = (this.currentState.constructor as Function).name;
                const curState = (newState.constructor as Function).name;
                const eventName = EPointerEventTypeNames[eventType];
                const name = this.plot.plotName == null ? "" : `${this.plot.plotName} `;

                _Debug.verboseLog(`${name}${prevState} -> ${curState} (${eventName})`);
            });

            this.currentState = newState;
        }
    }

    public onMouseEvent(eventType: EMouseEventType, $event: MouseEvent): void
    {
        this.pointerEventProvider.updatePointerEvent($event, this.pointerEvent);

        if (!this.plot.plotDimensionsOBL.clipSpaceArea.interactiveRange.isPointInRange(this.pointerEvent.pointerClipPosition))
        {
            // it's outside of the plot's range, only zoom is supported... do nothing
            return;
        }

        const newState = this.currentState.handleMouseEvent(eventType, this.pointerEvent);

        if (newState != null)
        {
            DEBUG_MODE && _Debug.runBlock(() =>
            {
                const prevState = (this.currentState.constructor as Function).name;
                const curState = (newState.constructor as Function).name;
                const eventName = EMouseEventTypeNames[eventType];
                const name = this.plot.plotName == null ? "" : `${this.plot.plotName} `;

                _Debug.verboseLog(`${name}${prevState} -> ${curState} (${eventName})`);
            });

            this.currentState = newState;
        }
    }

    private currentState: IChartState<TPlotRange>;
    private pointerEventProvider: IPointerEventProvider;
    private pointerEvent = ChartPointerEvent.createOneEmpty();
}
