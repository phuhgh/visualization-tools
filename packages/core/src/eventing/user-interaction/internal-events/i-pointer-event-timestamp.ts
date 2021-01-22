import { IChartPointerEvent } from "./chart-pointer-event";

/**
 * @public
 */
export interface IPointerEventTimestamp
{
    chartEvent: IChartPointerEvent<PointerEvent>;
    timestamp: number;
}