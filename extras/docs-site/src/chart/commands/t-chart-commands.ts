import { UpdateOnNextFrameCommand } from "./update-on-next-frame-command";
import { AddPlotCommand } from "./add-plot-command";
import { ResizeChartCommand } from "./resize-chart-command";

export type TChartCommands =
    | UpdateOnNextFrameCommand
    | AddPlotCommand
    | ResizeChartCommand
    ;