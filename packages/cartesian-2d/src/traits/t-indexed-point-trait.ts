import { TPoint2dDisplaySettings } from "./t-point2d-display-settings-trait";
import { TTypedArray } from "rc-js-util";
import { TPoint2dSizeNormalizer } from "./t-point2d-size-normalizer-trait";
import { T2dAbsoluteZIndexSettings } from "./t2d-absolute-z-index-trait";
import { T2dRelativeZIndexSettings } from "./t2d-relative-z-index-trait";
import { IDataTrait, IGraphicsComponentSettingsTrait, IIndexedDataConnector, TChangeTrackedTrait } from "@visualization-tools/core";

/**
 * @public
 */
export type TPoint2dSettings<TArray extends TTypedArray> =
    & TPoint2dDisplaySettings
    & TPoint2dSizeNormalizer<TArray>
    & T2dAbsoluteZIndexSettings
    & T2dRelativeZIndexSettings
    ;

/**
 * @public
 */
export type TIndexedPointTrait<TArray extends TTypedArray, TOffsets> =
    & IDataTrait<IIndexedDataConnector<TOffsets>>
    & IGraphicsComponentSettingsTrait<TPoint2dSettings<TArray>>
    & TChangeTrackedTrait
    ;