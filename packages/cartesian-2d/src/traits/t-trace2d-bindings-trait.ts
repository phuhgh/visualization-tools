import { IGraphicsComponentSettingsTrait, TChangeTrackedTrait } from "@visualization-tools/core";

/**
 * @public
 */
export type TTrace2dBindingsDisplaySetting = {
    readonly traces: Float32Array;
};

/**
 * @public
 */
export type TTrace2dBindingsTrait =
    & TChangeTrackedTrait
    & IGraphicsComponentSettingsTrait<TTrace2dBindingsDisplaySetting>
    ;