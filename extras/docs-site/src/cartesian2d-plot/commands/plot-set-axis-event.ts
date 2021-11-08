import { EPlotCommand } from "./e-plot-command";
import { APlotCommand } from "./a-plot-command";

export interface ISetAxisArg
{
    logX?: boolean,
    logY?: boolean
}

export class PlotSetAxisEvent extends APlotCommand<ISetAxisArg>
{
    public id = EPlotCommand.SetAxis as const;

    public constructor
    (
        public arg: ISetAxisArg,
    )
    {
        super();
    }
}