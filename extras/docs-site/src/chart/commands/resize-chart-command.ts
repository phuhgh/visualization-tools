import { AChartCommand } from "./a-chart-command";
import { EChartCommand } from "./e-chart-command";

export class ResizeChartCommand extends AChartCommand<{}>
{
    public id = EChartCommand.ResizeChart as const;
    public arg = {};
}