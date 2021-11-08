import { ADemoEvent } from "./a-demo-event";
import { EDemoEvent } from "./e-demo-event";
import { TPlotCommands } from "../../cartesian2d-plot/commands/t-plot-commands";
import { IPlotRange } from "@visualization-tools/core";

export class ProxyPlotCommand<TTraits> extends ADemoEvent<TPlotCommands<IPlotRange, TTraits>>
{
    public id = EDemoEvent.ProxyPlotCommand as const;

    public constructor
    (
        public arg: TPlotCommands<IPlotRange, TTraits>,
    )
    {
        super();
    }
}