import { EChartCommand } from "./e-chart-command";
import { IEvent } from "../../i-event";

export abstract class AChartCommand<TArg extends object>
{
    public abstract readonly arg: TArg;
    public abstract readonly id: EChartCommand;

    public static isChartCommand<TArg extends object>($event: IEvent<TArg>): $event is AChartCommand<TArg>
    {
        return $event instanceof AChartCommand;
    }
}