import { IChartConfig } from "./chart-config";

/**
 * @public
 * Base chart construction options.
 */
export interface IChartOptions
{
    chartContainer: HTMLElement,
    chartConfig: IChartConfig,
}