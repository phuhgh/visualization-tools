import { _Fp, _Production } from "rc-js-util";
import { EPointerEventType } from "../internal-events/e-pointer-event-type";
import { IChartState } from "./i-chart-state";
import { IInteractionOptions } from "../i-interaction-options";
import { IChartPointerEvent } from "../internal-events/chart-pointer-event";
import { IPlotInteractionProviders } from "../plot-interaction-providers";
import { IDefaultTargets } from "../hit-test/i-default-targets";
import { IInteractionSharedState } from "../i-interaction-shared-state";

export class PanningState<TPlotRange> implements IChartState<TPlotRange>
{
    public constructor
    (
        private readonly startEvent: IChartPointerEvent<PointerEvent>,
        private readonly options: IInteractionOptions,
        private readonly providers: IPlotInteractionProviders<TPlotRange, IDefaultTargets>,
        private readonly sharedState: IInteractionSharedState,
    )
    {
        this.previousClientX = startEvent.$event.clientX;
        this.previousClientY = startEvent.$event.clientY;
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
            {
                if (this.startEvent.$event.pointerId !== chartEvent.$event.pointerId)
                {
                    return null;
                }

                return this.providers.stateFactories.getIdleState(null, this.options, this.providers, this.sharedState);
            }
            case EPointerEventType.Down:
            {
                return _Fp.valueOrNull(
                    chartEvent.$event.pointerId !== this.startEvent.$event.pointerId,
                    this.providers.stateFactories.getPinchZoomingState(this.startEvent, chartEvent, this.options, this.providers, this.sharedState),
                );
            }
            case EPointerEventType.Move:
            {
                if (this.startEvent.$event.pointerId === chartEvent.$event.pointerId)
                {
                    const dx = chartEvent.$event.clientX - this.previousClientX;
                    const dy = chartEvent.$event.clientY - this.previousClientY;
                    const dims = this.providers.attachPoint.canvasDims;
                    // -y to normalize direction into clip space system
                    this.providers.callbacks.onPan(chartEvent, dx * dims.dpr, -dy * dims.dpr);
                    this.previousClientX = chartEvent.$event.clientX;
                    this.previousClientY = chartEvent.$event.clientY;
                }

                return null;
            }
        }

        return _Production.assertValueIsNever(eventType);
    }

    private previousClientX: number;
    private previousClientY: number;
}