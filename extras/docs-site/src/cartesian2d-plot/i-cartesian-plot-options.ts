import { BroadcastEvent, Range2d, TTypedArrayCtor } from "rc-js-util";
import { ICartesianPlotFactory } from "./i-cartesian-plot-factory";
import { ICartesian2dPlot, ICartesian2dPlotConstructionOptions, ICartesian2dPlotRange } from "@visualization-tools/cartesian-2d";
import { IChartComponent, TUnknownRenderer } from "@visualization-tools/core";
import { TPlotCommands } from "./commands/t-plot-commands";
import { IPlotCommandHandlers } from "./commands/plot-command-adapter";

export interface ICartesianPlotOptions<TRenderer extends TUnknownRenderer
    , TArrayCtor extends TTypedArrayCtor
    , TTraits>
{
    options: ICartesian2dPlotConstructionOptions<InstanceType<TArrayCtor>, TTraits>;
    plotFactory: ICartesianPlotFactory<TRenderer, InstanceType<TArrayCtor>, TTraits>;

    initialRange: Range2d<InstanceType<TArrayCtor>>;
    initialTransform: [boolean, boolean];
    commandChannel: BroadcastEvent<"onPlotCommand", [TPlotCommands<ICartesian2dPlotRange<InstanceType<TArrayCtor>>, TTraits>]>;
    commandHandlers: IPlotCommandHandlers<ICartesian2dPlotRange<InstanceType<TArrayCtor>>, TTraits>;

    onPlotCreated
    (
        plot: ICartesian2dPlot<TRenderer["TComponentRenderer"], InstanceType<TArrayCtor>, TTraits>,
        chart: IChartComponent<TRenderer>,
    )
        : void;
}