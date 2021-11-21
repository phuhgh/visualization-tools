import { IBroadcastEvent, IEmscriptenWrapper } from "rc-js-util";
import { ICartesian2dBindings } from "@visualization-tools/cartesian-2d";
import { TDemoCommands } from "./commands/t-demo-commands";
import { IChartOptions, TUnknownRenderer } from "@visualization-tools/core";
import { ICartesianPlotOptions } from "../cartesian2d-plot/i-cartesian-plot-options";
import { IChartComponentOptions } from "../chart/i-chart-component-options";
import { TDemoEvents } from "./events/t-demo-events";

export type TDemoCommandChannel = IBroadcastEvent<"onDemoCommand", [TDemoCommands]>;

export interface IDemoOptions<TTraits>
{
    title: string;
    subtitle?: string;
    commandChannel: TDemoCommandChannel;
}

export interface IEntityOptions<TTraits>
{
    entities: readonly TTraits[];
    selectedEntities: ReadonlySet<TTraits>;
}

export interface IDemoProps<TRenderer extends TUnknownRenderer
    , TArrayCtor extends Float32ArrayConstructor | Float64ArrayConstructor
    , TTraits>
{
    storageType: TArrayCtor;
    emscriptenModule: IEmscriptenWrapper<ICartesian2dBindings>;

    chartOptions: IChartComponentOptions<IChartOptions, TRenderer>;
    demoOptions: IDemoOptions<TTraits>;
    plotOptions: ICartesianPlotOptions<TRenderer, TArrayCtor, TTraits>;
    entityOptions: IEntityOptions<TTraits>;
    onDemoEvent: ($event: TDemoEvents<TTraits>) => void;
}
