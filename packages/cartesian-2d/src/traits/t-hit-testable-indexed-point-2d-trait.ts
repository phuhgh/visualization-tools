import { TTypedArray } from "rc-js-util";
import { TIndexedPointTrait } from "./t-indexed-point-trait";
import { IDrawablePoint2dOffsets } from "../series/i-drawable-point2d-offsets";
import { IHitTestableTrait } from "@visualization-tools/core";

/**
 * @public
 */
export type THitTestableIndexedPoint2dTrait<TArray extends TTypedArray> =
    & TIndexedPointTrait<TArray, IDrawablePoint2dOffsets>
    & IHitTestableTrait
    ;