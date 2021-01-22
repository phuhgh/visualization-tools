import { _Production } from "rc-js-util";
import { EPointerEventType } from "../internal-events/e-pointer-event-type";
import { IChartState } from "./i-chart-state";
import { IInteractionOptions } from "../i-interaction-options";
import { IChartPointerEvent } from "../internal-events/chart-pointer-event";
import { IPlotInteractionProviders } from "../plot-interaction-providers";
import { IDefaultTargets } from "../hit-test/i-default-targets";
import { IInteractionSharedState } from "../i-interaction-shared-state";

export class DraggingState<TPlotRange> implements IChartState<TPlotRange>
{
    public constructor
    (
        private readonly startEvent: IChartPointerEvent<PointerEvent>,
        private readonly options: IInteractionOptions,
        private readonly providers: IPlotInteractionProviders<TPlotRange, IDefaultTargets>,
        private readonly sharedState: IInteractionSharedState,
    )
    {
        // the starting event is one that needs to be handled straight away
        this.handlePointerEvent(EPointerEventType.Move, this.startEvent);
    }

    public handleMouseEvent(): IChartState<TPlotRange> | null
    {
        return null;
    }

    public handlePointerEvent(eventType: EPointerEventType, chartEvent: IChartPointerEvent<PointerEvent>): IChartState<TPlotRange> | null
    {
        switch (eventType)
        {
            case EPointerEventType.Out:
            case EPointerEventType.Up:
                if (this.startEvent.$event.pointerId === chartEvent.$event.pointerId)
                {
                    this.providers.callbacks.onDragEnd(chartEvent);

                    return this.providers.stateFactories.getIdleState(null, this.options, this.providers, this.sharedState);
                }
                else
                {
                    return null;
                }
            case EPointerEventType.Down:
            {
                return null;
            }
            case EPointerEventType.Move:
            {
                if (this.startEvent.$event.pointerId === chartEvent.$event.pointerId)
                {
                    this.providers.callbacks.onDrag(chartEvent);
                }

                return null;
            }
        }

        return _Production.assertValueIsNever(eventType);
    }
}