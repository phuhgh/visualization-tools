import { IGraphicsComponentSettingsTrait } from "@visualization-tools/core";

/**
 * @public
 */
export type TTrace2dDisplaySettings = {
    readonly traceLinePixelSize: number;
    readonly traceColor: number;
};

/**
 * @public
 */
export type TTrace2dDisplaySettingsTrait = IGraphicsComponentSettingsTrait<TTrace2dDisplaySettings>;
