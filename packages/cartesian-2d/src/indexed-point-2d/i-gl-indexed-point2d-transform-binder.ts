import { TTypedArray } from "rc-js-util";
import { TIndexedPointTrait } from "../traits/t-indexed-point-trait";
import { IDrawablePoint2dOffsets } from "../series/i-drawable-point2d-offsets";
import { IGlIndexedPoint2dBinder } from "./i-gl-indexed-point2d-binder";
import { IGlInstancedBinder, IGlTransformBinder, TGl2ComponentRenderer, TGlF32BufferLayout } from "@visualization-tools/core";

/**
 * @public
 */
export interface IGlIndexedPoint2dTransformBinder<TArray extends TTypedArray>
    extends IGlInstancedBinder<TGl2ComponentRenderer, TIndexedPointTrait<TArray, IDrawablePoint2dOffsets>, TGlF32BufferLayout>,
            IGlTransformBinder<TIndexedPointTrait<TArray, IDrawablePoint2dOffsets>, IGlIndexedPoint2dBinder<TArray>, TGl2ComponentRenderer>
{
    /**
     * The number of points that will be bound in the vertex shader.
     */
    readonly pointsBound: number;
    setPointers(startIndex: number, blockByteSize: number): void;
}