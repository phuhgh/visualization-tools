import { EPointerEventType } from "../internal-events/e-pointer-event-type";
import { EMouseEventType } from "../internal-events/e-mouse-event-type";
import { IChartPointerEvent } from "../internal-events/chart-pointer-event";

/**
 * @public
 * Base user interaction state.
 */
export interface IChartState<TPlotRange>
{
    handlePointerEvent(eventType: EPointerEventType, chartEvent: IChartPointerEvent<PointerEvent>): IChartState<TPlotRange> | null;
    handleMouseEvent(eventType: EMouseEventType, chartEvent: IChartPointerEvent<MouseEvent>): IChartState<TPlotRange> | null;
}
