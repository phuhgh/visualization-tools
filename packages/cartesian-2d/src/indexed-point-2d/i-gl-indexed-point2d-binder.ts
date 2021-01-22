import { TIndexedPointTrait } from "../traits/t-indexed-point-trait";
import { IDrawablePoint2dOffsets } from "../series/i-drawable-point2d-offsets";
import { TTypedArray } from "rc-js-util";
import { TInterleavedPoint2dTrait } from "../traits/t-interleaved-point2d-trait";
import { IGlInstancedBinder, TGl2EntityRenderer } from "@visualization-tools/core";

/**
 * @public
 */
export interface IGlIndexedPoint2dBinder<TArray extends TTypedArray>
    extends IGlInstancedBinder<TIndexedPointTrait<TArray, IDrawablePoint2dOffsets>, TGl2EntityRenderer>
{
    /**
     * The number of points that will be bound in the vertex shader.
     */
    readonly pointsBound: number;
    setPointers(startIndex: number, blockByteSize: number): void;
    overrideColors(entityRenderer: TGl2EntityRenderer, entity: TInterleavedPoint2dTrait<Float32Array>): void;
}

/**
 * @public
 */
export type THighlightColorOverride = [index: number, packedColor: Float32Array];