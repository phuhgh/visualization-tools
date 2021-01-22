import { _Production } from "rc-js-util";
import { EPointerEventType } from "../internal-events/e-pointer-event-type";
import { IChartState } from "./i-chart-state";
import { IInteractionOptions } from "../i-interaction-options";
import { IPointerEventTimestamp } from "../internal-events/i-pointer-event-timestamp";
import { IChartPointerEvent } from "../internal-events/chart-pointer-event";
import { EMouseEventType } from "../internal-events/e-mouse-event-type";
import { EPointerEventButton } from "../internal-events/e-pointer-event-button";
import { IPlotInteractionProviders } from "../plot-interaction-providers";
import { IDefaultTargets } from "../hit-test/i-default-targets";
import { IInteractionSharedState } from "../i-interaction-shared-state";
import { IDraggableTrait } from "../../../entities/traits/i-draggable-trait";

/**
 * @public
 * The initial state of the default user interaction state machine.
 */
export class IdleState<TPlotRange> implements IChartState<TPlotRange>
{
    public constructor
    (
        private lastClick: IPointerEventTimestamp | null,
        private readonly options: IInteractionOptions,
        private readonly providers: IPlotInteractionProviders<TPlotRange, IDefaultTargets>,
        private readonly sharedState: IInteractionSharedState,
    )
    {
        if (this.lastClick != null && this.options.doubleClickOptions != null)
        {
            setTimeout(() => this.lastClick = null, this.options.doubleClickOptions.timeout);
        }
    }

    public handleMouseEvent(eventType: EMouseEventType, chartEvent: IChartPointerEvent<MouseEvent>): IChartState<TPlotRange> | null
    {
        switch (eventType)
        {
            case EMouseEventType.Wheel:
            {
                this.providers.callbacks.onWheel(chartEvent, -(chartEvent.$event as WheelEvent).deltaY);

                return null;
            }
        }

        return _Production.assertValueIsNever(eventType);
    }

    public handlePointerEvent(eventType: EPointerEventType, chartEvent: IChartPointerEvent<PointerEvent>): IChartState<TPlotRange> | null
    {
        switch (eventType)
        {
            case EPointerEventType.Down:
            {
                if (chartEvent.$event.button === EPointerEventButton.LeftMouse)
                {
                    const targets = this.providers.eventTargets.dragTargetProvider.hitTestPlot(chartEvent);

                    if (targets.length > 0)
                    {
                        this.sharedState.dragTargets = this.providers.callbacks.onDragStart(targets, chartEvent)
                            ? targets.filter(target => (target.entity as IDraggableTrait).onDragStart?.(chartEvent, target.segmentIds))
                            : null;

                        if (this.sharedState.dragTargets != null)
                        {
                            return this.providers.stateFactories.getDraggingState(chartEvent, this.options, this.providers, this.sharedState);
                        }
                    }

                    // fall through intentional
                    return this.providers.stateFactories.getIndeterminateState(
                        chartEvent,
                        this.options,
                        this.providers,
                        this.sharedState,
                        this.lastClick,
                    );
                }
                else if (chartEvent.$event.button === EPointerEventButton.RightMouse)
                {
                    // right click, no need to go via indeterminate
                    this.sharedState.onClick(chartEvent);

                    return null;
                }
                else
                {
                    return null;
                }
            }
            case EPointerEventType.Move:
            {
                this.sharedState.onHover(chartEvent);

                return null;
            }
            case EPointerEventType.Out:
            case EPointerEventType.Up:
                this.sharedState.clearAllHoveredEntities(chartEvent);

                return null;
        }

        return _Production.assertValueIsNever(eventType);
    }
}