import { PlotAddEntityCommand } from "./plot-add-entity-command";
import { IPlotRange } from "@visualization-tools/core";
import { PlotSetAxisEvent } from "./plot-set-axis-event";

export type TPlotCommands<TPlotRange extends IPlotRange, TTraits> =
    | PlotAddEntityCommand<TPlotRange, TTraits>
    | PlotSetAxisEvent
    ;