import { _Debug, _Production } from "rc-js-util";
import { EPointerEventType } from "../internal-events/e-pointer-event-type";
import { IChartState } from "./i-chart-state";
import { IInteractionOptions } from "../i-interaction-options";
import { IPointerEventTimestamp } from "../internal-events/i-pointer-event-timestamp";
import { getDistanceBetweenPointerEvents } from "../util/get-distance-between-pointer-events";
import { IChartPointerEvent } from "../internal-events/chart-pointer-event";
import { IPlotInteractionProviders } from "../plot-interaction-providers";
import { IDefaultTargets } from "../hit-test/i-default-targets";
import { IInteractionSharedState } from "../i-interaction-shared-state";

export class IndeterminateState<TPlotRange> implements IChartState<TPlotRange>
{
    public constructor
    (
        private readonly downEvent: IChartPointerEvent<PointerEvent>,
        private readonly options: IInteractionOptions,
        private readonly providers: IPlotInteractionProviders<TPlotRange, IDefaultTargets>,
        private readonly sharedState: IInteractionSharedState,
        private readonly lastClick: IPointerEventTimestamp | null,
    )
    {
    }

    public handleMouseEvent(): IChartState<TPlotRange> | null
    {
        return null;
    }

    public handlePointerEvent(eventType: EPointerEventType, chartEvent: IChartPointerEvent<PointerEvent>): IChartState<TPlotRange> | null
    {
        DEBUG_MODE && _Debug.runBlock(() =>
        {
            _Debug.assert(this.downEvent !== chartEvent, "event must be cloned");
        });

        switch (eventType)
        {
            case EPointerEventType.Down:
            {
                if (chartEvent.$event.pointerId !== this.downEvent.$event.pointerId)
                {
                    this.sharedState.clearAllHoveredEntities(chartEvent);
                    return this.providers.stateFactories.getPinchZoomingState(this.downEvent, chartEvent, this.options, this.providers, this.sharedState);
                }
                else
                {
                    return null;
                }
            }
            case EPointerEventType.Move:
            {
                if (this.downEvent.$event.pointerId !== chartEvent.$event.pointerId)
                {
                    return null;
                }

                return this.providers.stateFactories.getPanningState(chartEvent, this.options, this.providers, this.sharedState);
            }
            case EPointerEventType.Out:
            {
                return this.providers.stateFactories.getIdleState(null, this.options, this.providers, this.sharedState);
            }
            case EPointerEventType.Up:
            {
                if (this.isDoubleClick(chartEvent.$event))
                {
                    this.sharedState.onDblClick(chartEvent);
                    return this.providers.stateFactories.getIdleState(null, this.options, this.providers, this.sharedState);
                }
                else
                {
                    this.sharedState.onClick(chartEvent);
                    return this.providers.stateFactories.getIdleState({ chartEvent: chartEvent, timestamp: performance.now() }, this.options, this.providers, this.sharedState);
                }
            }
        }

        return _Production.assertValueIsNever(eventType);
    }

    private isDoubleClick(upEvent: PointerEvent): boolean
    {

        if (this.options.doubleClickOptions == null)
        {
            // the feature is not enabled
            return false;
        }

        if (this.lastClick == null || this.downEvent.$event.pointerId !== upEvent.pointerId)
        {
            // down event, up event and the previous up event are not the same pointer
            return false;
        }

        if (performance.now() > this.lastClick.timestamp + this.options.doubleClickOptions.timeout)
        {
            // too much time has passed
            return false;
        }

        // compare based on up events only, gives the user a chance to change their mind
        if (getDistanceBetweenPointerEvents(this.lastClick.chartEvent.$event, upEvent) > this.options.doubleClickOptions.maxRadius)
        {
            // too far apart
            return false;
        }

        // there is a vague chance they meant to double tap
        return true;
    }
}