import { TTypedArray } from "rc-js-util";
import { TPoint2dSettings } from "./t-indexed-point-trait";
import { IDataTrait, IGraphicsComponentSettingsTrait, ISharedInterleavedConnector, TChangeTrackedTrait } from "@visualization-tools/core";

/**
 * @public
 */
export type TSharedInterleavedPoint2dTrait<TArray extends TTypedArray, TOffsets> =
    & IDataTrait<ISharedInterleavedConnector<TArray, TOffsets>>
    & IGraphicsComponentSettingsTrait<TPoint2dSettings<TArray>>
    & TChangeTrackedTrait
    ;
