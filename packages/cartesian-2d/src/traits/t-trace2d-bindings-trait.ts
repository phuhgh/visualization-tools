import { IGraphicsComponentSettingsTrait, TChangeTrackedTrait } from "@visualization-tools/core";
import { TTypedArray } from "rc-js-util";

/**
 * @public
 */
export type TTrace2dBindingsDisplaySetting = {
    readonly traces: TTypedArray;
};

/**
 * @public
 */
export type TTrace2dBindingsTrait =
    & TChangeTrackedTrait
    & IGraphicsComponentSettingsTrait<TTrace2dBindingsDisplaySetting>
    ;