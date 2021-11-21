import { ADemoEvent } from "./a-demo-event";
import { EDemoEvent } from "./e-demo-event";

export class ResetDemoEvent extends ADemoEvent<{}>
{
    public id = EDemoEvent.ResetDemo as const;
    public arg = {};
}