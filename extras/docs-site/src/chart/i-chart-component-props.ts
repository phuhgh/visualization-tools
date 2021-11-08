import { IChartComponentOptions } from "./i-chart-component-options";
import { IChartOptions, TUnknownRenderer } from "@visualization-tools/core";
import { TChartCommands } from "./commands/t-chart-commands";
import { BroadcastEvent } from "rc-js-util";
import { TChartEvents } from "./events/t-chart-events";

export type TChartCommandChannel = BroadcastEvent<"onChartCommand", [TChartCommands]>;

export interface IChartComponentProps<TOptions extends IChartOptions, TRenderer extends TUnknownRenderer>
{
    options: IChartComponentOptions<TOptions, TRenderer>;
    onChartEvent: (arg: TChartEvents<TRenderer>) => void;
}