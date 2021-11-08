import { EPlotEvent } from "./e-plot-event";
import { IEvent } from "../../i-event";

export abstract class APlotEvent<TArg extends object>
{
    public abstract readonly id: EPlotEvent;
    public abstract readonly arg: TArg;

    public static isPlotEvent<TArg extends object>($event: IEvent<TArg>): $event is APlotEvent<TArg>
    {
        return $event instanceof APlotEvent;
    }
}