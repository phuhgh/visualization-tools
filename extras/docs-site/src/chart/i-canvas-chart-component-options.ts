import { IChartComponentOptions } from "./i-chart-component-options";
import { ICanvasChartOptions, ICanvasRenderer } from "@visualization-tools/core";

export interface ICanvasChartComponentOptions
    extends IChartComponentOptions<ICanvasChartOptions, ICanvasRenderer>
{
}
