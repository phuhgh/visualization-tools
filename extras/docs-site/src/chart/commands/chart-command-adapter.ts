import { _Production, TListener } from "rc-js-util";
import { TChartCommands } from "./t-chart-commands";
import { EChartCommand } from "./e-chart-command";
import { IChartComponent, TUnknownRenderer } from "@visualization-tools/core";

export class ChartCommandAdapter<TRenderer extends TUnknownRenderer>
    implements TListener<"onChartCommand", [TChartCommands]>
{
    public constructor
    (
        private chart: IChartComponent<TRenderer>,
    )
    {
    }

    public onChartCommand($event: TChartCommands): void
    {
        switch ($event.id)
        {
            case EChartCommand.UpdateOnNextFrame:
            {
                this.chart.updateOnNextFrame($event.arg.plot, $event.arg.updateInteractionHandler);
                break;
            }
            case EChartCommand.AddPlot:
            {
                this.chart.addPlot($event.arg.plot);
                break;
            }
            case EChartCommand.ResizeChart:
            {
                this.chart.resize();
                this.chart.updateOnNextFrame();
                break;
            }
            default:
            {
                _Production.assertValueIsNever($event);
                break;
            }
        }
    }
}