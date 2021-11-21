import { _Production, BroadcastEvent, TListener } from "rc-js-util";
import { TPlotCommands } from "./t-plot-commands";
import { EPlotCommand } from "./e-plot-command";
import { IPlot, IPlotRange } from "@visualization-tools/core";
import { UpdateOnNextFrameCommand } from "../../chart/commands/update-on-next-frame-command";
import { ISetAxisArg } from "./plot-set-axis-event";
import { TChartCommandChannel } from "../../chart/i-chart-component-props";

export type TPlotCommandChannel<TPlotRange extends IPlotRange, TTraits> = BroadcastEvent<"onPlotCommand", [TPlotCommands<TPlotRange, TTraits>]>;

export interface IPlotCommandHandlers<TPlotRange extends IPlotRange, TTraits>
{
    onSetAxis(plot: IPlot<TPlotRange, TTraits>, arg: ISetAxisArg): void;
    onResetAxis(plot: IPlot<TPlotRange, TTraits>): void;
}

export class PlotCommandAdapter<TPlotRange extends IPlotRange, TTraits>
    implements TListener<"onPlotCommand", [TPlotCommands<TPlotRange, TTraits>]>
{
    public constructor
    (
        private plot: IPlot<TPlotRange, TTraits>,
        private chartCommandChannel: TChartCommandChannel,
        private handlers: IPlotCommandHandlers<TPlotRange, TTraits>,
    )
    {
    }

    public onPlotCommand($event: TPlotCommands<TPlotRange, TTraits>): void
    {
        switch ($event.id)
        {
            case EPlotCommand.AddEntity:
            {
                $event.arg.addEntityCallback(this.plot);
                break;
            }
            case EPlotCommand.SetAxis:
            {
                this.handlers.onSetAxis(this.plot, $event.arg);
                this.chartCommandChannel.emit(new UpdateOnNextFrameCommand({}));
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