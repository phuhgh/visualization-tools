import { IChartComponent, IChartOptions, TUnknownRenderer } from "@visualization-tools/core";

export interface IChartFactory<TOptions extends IChartOptions, TRenderer extends TUnknownRenderer>
{
    createOne(options: TOptions): IChartComponent<TRenderer> | null;
}