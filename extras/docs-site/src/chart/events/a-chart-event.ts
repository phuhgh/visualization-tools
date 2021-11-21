import { EChartEvent } from "./e-chart-event";
import { IEvent } from "../../i-event";

export abstract class AChartEvent<TArg extends object>
{
    public abstract readonly id: EChartEvent;
    public abstract readonly arg: TArg;

    public static isChartEvent<TArg extends object>($event: IEvent<TArg>): $event is AChartEvent<TArg>
    {
        return $event instanceof AChartEvent;
    }
}