import { TIndexedPointTrait } from "../traits/t-indexed-point-trait";
import { IDrawablePoint2dOffsets } from "../series/i-drawable-point2d-offsets";
import { TTypedArray } from "rc-js-util";
import { TInterleavedPoint2dTrait } from "../traits/t-interleaved-point2d-trait";
import { IGlInstancedBinder, IGlTransformBinder, ILinkableBinder, ITransformBinderProvider, TGl2ComponentRenderer } from "@visualization-tools/core";

/**
 * @public
 */
export const IndexedPoint2dIdentifier = Symbol("indexed point2d binder");

/**
 * @public
 */
export interface IGlIndexedPoint2dBinder<TArray extends TTypedArray>
    extends IGlInstancedBinder<TGl2ComponentRenderer, TIndexedPointTrait<TArray, IDrawablePoint2dOffsets>>,
            IGlTransformBinder<TIndexedPointTrait<TArray, IDrawablePoint2dOffsets>, IGlIndexedPoint2dBinder<TArray>, TGl2ComponentRenderer>,
            ILinkableBinder<TGl2ComponentRenderer>,
            ITransformBinderProvider<IGlIndexedPoint2dBinder<TArray>>
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
