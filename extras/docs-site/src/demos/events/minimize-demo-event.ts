import { ADemoEvent } from "./a-demo-event";
import { EDemoEvent } from "./e-demo-event";

export class MinimizeDemoEvent extends ADemoEvent<{}>
{
    public id = EDemoEvent.MinimizeDemo as const;
    public arg = {};
}