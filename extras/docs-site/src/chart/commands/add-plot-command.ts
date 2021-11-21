import { AChartCommand } from "./a-chart-command";
import { EChartCommand } from "./e-chart-command";
import { IPlot, IPlotRange } from "@visualization-tools/core";

export interface IAddPlotArg
{
    plot: IPlot<IPlotRange, unknown>;
}

export class AddPlotCommand extends AChartCommand<IAddPlotArg>
{
    public id = EChartCommand.AddPlot as const;

    public constructor
    (
        public arg: IAddPlotArg,
    )
    {
        super();
    }
}