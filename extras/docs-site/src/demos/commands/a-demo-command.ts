import { EDemoCommand } from "./e-demo-command";
import { IEvent } from "../../i-event";

export abstract class ADemoCommand<TArg extends object>
{
    public abstract readonly arg: TArg;
    public abstract readonly id: EDemoCommand;

    public static isChartCommand<TArg extends object>($event: IEvent<TArg>): $event is ADemoCommand<TArg>
    {
        return $event instanceof ADemoCommand;
    }
}