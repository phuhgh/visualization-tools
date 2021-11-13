import { TIndexedPointTrait } from "../traits/t-indexed-point-trait";
import { IDrawablePoint2dOffsets } from "../series/i-drawable-point2d-offsets";
import { TTypedArray } from "rc-js-util";
import { TInterleavedPoint2dTrait } from "../traits/t-interleaved-point2d-trait";
import { IGlInstancedBinder, ILinkableBinder, ITransformBinderProvider, TGl2ComponentRenderer, TGlF32BufferLayout } from "@visualization-tools/core";
import { IGlIndexedPoint2dTransformBinder } from "./i-gl-indexed-point2d-transform-binder";

/**
 * @public
 */
export const IndexedPoint2dIdentifier = Symbol("indexed point2d binder");

/**
 * @public
 */
export interface IGlIndexedPoint2dBinder<TArray extends TTypedArray>
    extends IGlInstancedBinder<TGl2ComponentRenderer, TIndexedPointTrait<TArray, IDrawablePoint2dOffsets>, TGlF32BufferLayout>,
            ILinkableBinder<TGl2ComponentRenderer>,
            ITransformBinderProvider<IGlIndexedPoint2dTransformBinder<TArray>>
{
    /**
     * The number of points that will be bound in the vertex shader.
     */
    readonly pointsBound: number;
    setPointers(startIndex: number, blockByteSize: number): void;
    overrideColors
    (
        componentRenderer: TGl2ComponentRenderer,
        entity: TInterleavedPoint2dTrait<Float32Array>,
        changeId: number,
    )
        : void;
}
