import { _Production, TListener } from "rc-js-util";
import { TDemoCommands } from "../commands/t-demo-commands";
import { EDemoCommand } from "../commands/e-demo-command";
import { TUnknownRenderer } from "@visualization-tools/core";
import { ResizeChartCommand } from "../../chart/commands/resize-chart-command";
import { TChartCommandChannel } from "../../chart/i-chart-component-props";

export class PlotDemoCommandAdapter<TRenderer extends TUnknownRenderer>
    implements TListener<"onDemoCommand", [TDemoCommands]>
{
    public constructor
    (
        private readonly onChartCommand: TChartCommandChannel,
    )
    {
    }

    public onDemoCommand($event: TDemoCommands): void
    {
        switch ($event.id)
        {
            case EDemoCommand.ResizeDemo:
            {
                this.onChartCommand.emit(new ResizeChartCommand());
                break;
            }
            default:
            {
                _Production.assertValueIsNever($event.id);
                break;
            }
        }
    }
}