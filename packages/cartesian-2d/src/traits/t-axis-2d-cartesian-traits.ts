import { IGraphicsComponentSettingsTrait } from "@visualization-tools/core";
import { ICartesian2dAxisLabelConfig } from "../plot/options/cartesian2d-axis-label-config";

/**
 * @public
 */
export type TCartesian2dAxisSettings = {
    axis: ICartesian2dAxisLabelConfig;
};

/**
 * @public
 */
export type TCartesian2dAxisTrait = IGraphicsComponentSettingsTrait<TCartesian2dAxisSettings>;