import { IPlot, IPlotRange } from "@visualization-tools/core";
import { EPlotCommand } from "./e-plot-command";
import { APlotCommand } from "./a-plot-command";

export interface IPlotAddEntityArg<TPlotRange extends IPlotRange, TTraits>
{
    addEntityCallback: (plot: IPlot<TPlotRange, TTraits>) => void;
}

export class PlotAddEntityCommand<TPlotRange extends IPlotRange, TTraits>
    extends APlotCommand<IPlotAddEntityArg<TPlotRange, TTraits>>
{
    public id = EPlotCommand.AddEntity as const;

    public constructor
    (
        public arg: IPlotAddEntityArg<TPlotRange, TTraits>,
    )
    {
        super();
    }
}