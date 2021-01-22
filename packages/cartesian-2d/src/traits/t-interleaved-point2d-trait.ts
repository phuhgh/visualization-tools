import { TTypedArray } from "rc-js-util";
import { IDrawablePoint2dOffsets } from "../series/i-drawable-point2d-offsets";
import { TPoint2dSettings } from "./t-indexed-point-trait";
import { IDataTrait, IGraphicsComponentSettingsTrait, IInterleavedConnector, TChangeTrackedTrait } from "@visualization-tools/core";

/**
 * @public
 */
export type TInterleavedPoint2dTrait<TArray extends TTypedArray> =
    & IDataTrait<IInterleavedConnector<TArray, IDrawablePoint2dOffsets>>
    & IGraphicsComponentSettingsTrait<TPoint2dSettings<TArray>>
    & TChangeTrackedTrait
    ;
