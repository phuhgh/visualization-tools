import { IEvent } from "../../i-event";
import { EDemoEvent } from "./e-demo-event";

export abstract class ADemoEvent<TArg extends object>
{
    public abstract readonly id: EDemoEvent;
    public abstract readonly arg: TArg;

    public static isDemoEvent<TArg extends object>($event: IEvent<TArg>): $event is ADemoEvent<TArg>
    {
        return $event instanceof ADemoEvent;
    }
}