import { ADemoEvent } from "./a-demo-event";
import { EDemoEvent } from "./e-demo-event";

export class MaximizeDemoEvent extends ADemoEvent<{}>
{
    public id = EDemoEvent.MaximizeDemo as const;
    public arg = {};
}