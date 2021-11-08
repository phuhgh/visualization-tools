import { EPlotCommand } from "./e-plot-command";
import { IEvent } from "../../i-event";

export abstract class APlotCommand<TArg extends object>
{
    public abstract readonly arg: TArg;
    public abstract readonly id: EPlotCommand;

    public static isPlotCommand<TArg extends object>($event: IEvent<TArg>): $event is APlotCommand<TArg>
    {
        return $event instanceof APlotCommand;
    }
}