import { _Debug, _Fp, _Math, _Production, Vec2 } from "rc-js-util";
import { EPointerEventType } from "../internal-events/e-pointer-event-type";
import { IChartState } from "./i-chart-state";
import { IInteractionOptions } from "../i-interaction-options";
import { getDistanceBetweenPointerEvents } from "../util/get-distance-between-pointer-events";
import { IChartPointerEvent } from "../internal-events/chart-pointer-event";
import { IPlotInteractionProviders } from "../plot-interaction-providers";
import { getCenterBetweenPointerEvents } from "../util/get-center-between-pointer-events";
import { IDefaultTargets } from "../i-default-targets";
import { IInteractionSharedState } from "../i-interaction-shared-state";

/**
 * Allows for panning as well as zooming.
 */
export class PinchZoomingState<TPlotRange> implements IChartState<TPlotRange>
{
    public constructor
    (
        private firstFingerDownEvent: IChartPointerEvent<PointerEvent>,
        private secondFingerDownEvent: IChartPointerEvent<PointerEvent>,
        private readonly options: IInteractionOptions,
        private readonly providers: IPlotInteractionProviders<TPlotRange, IDefaultTargets>,
        private readonly sharedState: IInteractionSharedState,
    )
    {
        const distanceBetweenPointerEvents = getDistanceBetweenPointerEvents(firstFingerDownEvent.$event, secondFingerDownEvent.$event);
        // remove possibility of zeros
        this.initialDistance = _Math.max(distanceBetweenPointerEvents, 1);

        getCenterBetweenPointerEvents(firstFingerDownEvent, secondFingerDownEvent, this.cssCenterPoint);
        this.providers.callbacks.onPanZoomStart(this.cssCenterPoint, this.initialDistance);
    }

    public handleMouseEvent(): IChartState<TPlotRange> | null
    {
        return null;
    }

    public handlePointerEvent(eventType: EPointerEventType, chartEvent: IChartPointerEvent<PointerEvent>): IChartState<TPlotRange> | null
    {
        DEBUG_MODE && _Debug.runBlock(() =>
        {
            _Debug.assert(this.firstFingerDownEvent !== chartEvent, "event must be cloned");
            _Debug.assert(this.secondFingerDownEvent !== chartEvent, "event must be cloned");
        });

        this.updateEvents(chartEvent);
        getCenterBetweenPointerEvents(this.firstFingerDownEvent, this.secondFingerDownEvent, this.cssCenterPoint);

        switch (eventType)
        {
            case EPointerEventType.Out:
            case EPointerEventType.Up:
            {
                return _Fp.valueOrNull(
                    this.isInitialPointer(chartEvent),
                    this.providers.stateFactories.getPanningState(this.getRemainingEvent(chartEvent), this.options, this.providers, this.sharedState),
                );
            }
            case EPointerEventType.Down:
                // don't support touch support for more than 2 fingers
                return null;
            case EPointerEventType.Move:
            {
                if (this.isInitialPointer(chartEvent))
                {
                    const distanceBetweenPointerEvents = getDistanceBetweenPointerEvents(this.firstFingerDownEvent.$event, this.secondFingerDownEvent.$event);
                    // remove possibility of divide by 0
                    const currentDistance = _Math.max(distanceBetweenPointerEvents, 1);
                    this.providers.callbacks.onPanZoomChange(chartEvent, this.cssCenterPoint, currentDistance);
                }
                return null;
            }
        }

        return _Production.assertValueIsNever(eventType);
    }

    private updateEvents(chartEvent: IChartPointerEvent<PointerEvent>): void
    {
        if (this.firstFingerDownEvent.$event.pointerId === chartEvent.$event.pointerId)
        {
            this.firstFingerDownEvent = chartEvent.clone();
        }
        else if (this.secondFingerDownEvent.$event.pointerId === chartEvent.$event.pointerId)
        {
            this.secondFingerDownEvent = chartEvent.clone();
        }
    }

    private isInitialPointer(chartEvent: IChartPointerEvent<PointerEvent>): boolean
    {
        return this.firstFingerDownEvent.$event.pointerId === chartEvent.$event.pointerId
               || this.secondFingerDownEvent.$event.pointerId === chartEvent.$event.pointerId;
    }

    private getRemainingEvent(chartEvent: IChartPointerEvent<PointerEvent>): IChartPointerEvent<PointerEvent>
    {
        return this.firstFingerDownEvent.$event.pointerId === chartEvent.$event.pointerId
            ? this.secondFingerDownEvent
            : this.firstFingerDownEvent;
    }

    private readonly initialDistance: number;
    private readonly cssCenterPoint = new Vec2.f32();
}