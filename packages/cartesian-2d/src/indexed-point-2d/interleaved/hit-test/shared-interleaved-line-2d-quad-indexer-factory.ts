import { IEmscriptenWrapper } from "rc-js-util";
import { ISharedInterleavedPoint2dQuadIndexer, SharedInterleavedPoint2dQuadIndexer, TInterleavedPoint2dQuadIndexerBindings } from "./shared-interleaved-point-2d-quad-indexer";

/**
 * @public
 */
export type TIInterleavedLine2dQuadIndexerPrefix =
    | "f32Interleaved2dLineQuadIndexer"
    | "f64Interleaved2dLineQuadIndexer"
    ;

/**
 * @public
 */
export interface IInterleavedLine2dQuadIndexerBindings extends TInterleavedPoint2dQuadIndexerBindings<TIInterleavedLine2dQuadIndexerPrefix>
{
}

/**
 * @public
 * Creates a {@link ISharedInterleavedPoint2dQuadIndexer} for capless lines.
 */
export class SharedInterleavedLine2dQuadIndexerFactory
{
    public static createOneF32
    (
        wrapper: IEmscriptenWrapper<IInterleavedLine2dQuadIndexerBindings>,
    )
        : ISharedInterleavedPoint2dQuadIndexer<Float32Array>
    {
        return SharedInterleavedPoint2dQuadIndexer.createOne(wrapper, "f32Interleaved2dLineQuadIndexer", Float32Array);
    }

    public static createOneF64
    (
        wrapper: IEmscriptenWrapper<IInterleavedLine2dQuadIndexerBindings>,
    )
        : ISharedInterleavedPoint2dQuadIndexer<Float64Array>
    {
        return SharedInterleavedPoint2dQuadIndexer.createOne(wrapper, "f64Interleaved2dLineQuadIndexer", Float64Array);
    }
}
