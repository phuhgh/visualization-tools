import { TTypedArray } from "rc-js-util";
import { TSharedInterleavedPoint2dTrait } from "./t-shared-interleaved-point2d-trait";
import { IDrawablePoint2dOffsets } from "../series/i-drawable-point2d-offsets";
import { IHitTestableTrait } from "@visualization-tools/core";

/**
 * @public
 */
export type THitTestableSharedInterleavedPoint2dTrait<TArray extends TTypedArray> =
    & TSharedInterleavedPoint2dTrait<TArray, IDrawablePoint2dOffsets>
    & IHitTestableTrait
    ;