import { AChartCommand } from "./a-chart-command";
import { EChartCommand } from "./e-chart-command";
import { IPlot, IPlotRange } from "@visualization-tools/core";

export interface IUpdateOnNextFrameArg
{
    plot?: IPlot<IPlotRange, unknown>;
    /**
     * Default true.
     */
    updateInteractionHandler?: boolean;
}

export class UpdateOnNextFrameCommand extends AChartCommand<IUpdateOnNextFrameArg>
{
    public id = EChartCommand.UpdateOnNextFrame as const;

    public constructor
    (
        public arg: IUpdateOnNextFrameArg,
    )
    {
        super();
    }
}