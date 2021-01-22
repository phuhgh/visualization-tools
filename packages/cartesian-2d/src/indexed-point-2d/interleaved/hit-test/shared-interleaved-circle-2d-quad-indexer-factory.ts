import { IEmscriptenWrapper } from "rc-js-util";
import { ISharedInterleavedPoint2dQuadIndexer, SharedInterleavedPoint2dQuadIndexer, TInterleavedPoint2dQuadIndexerBindings } from "./shared-interleaved-point-2d-quad-indexer";

/**
 * @public
 */
export type TIInterleavedCircle2dQuadIndexerPrefix =
    | "f32Interleaved2dCircleQuadIndexer"
    | "f64Interleaved2dCircleQuadIndexer"
    ;

/**
 * @public
 */
export interface IInterleavedCircle2dQuadIndexerBindings extends TInterleavedPoint2dQuadIndexerBindings<TIInterleavedCircle2dQuadIndexerPrefix>
{
}

/**
 * @public
 * Creates a {@link ISharedInterleavedPoint2dQuadIndexer} for capless circles.
 */
export class SharedInterleavedCircle2dQuadIndexerFactory
{
    public static createOneF32
    (
        wrapper: IEmscriptenWrapper<IInterleavedCircle2dQuadIndexerBindings>,
    )
        : ISharedInterleavedPoint2dQuadIndexer<Float32Array>
    {
        return SharedInterleavedPoint2dQuadIndexer.createOne(wrapper, "f32Interleaved2dCircleQuadIndexer", Float32Array);
    }

    public static createOneF64
    (
        wrapper: IEmscriptenWrapper<IInterleavedCircle2dQuadIndexerBindings>,
    )
        : ISharedInterleavedPoint2dQuadIndexer<Float64Array>
    {
        return SharedInterleavedPoint2dQuadIndexer.createOne(wrapper, "f32Interleaved2dCircleQuadIndexer", Float64Array);
    }
}
