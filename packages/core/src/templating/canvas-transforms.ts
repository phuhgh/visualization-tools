import { IReadonlyMat3 } from "rc-js-util";

/**
 * @public
 * Provides a set of common 2d transforms from pixel to clip space etc.
 */
export interface ICanvasTransforms
{
    readonly clipToPixel: IReadonlyMat3<Float32Array>;
    readonly clipToCss: IReadonlyMat3<Float32Array>;
    readonly pixelToClip: IReadonlyMat3<Float32Array>;
    readonly cssToClip: IReadonlyMat3<Float32Array>;
}

/**
 * @public
 * {@inheritDoc ICanvasTransforms}
 */
export class CanvasTransforms implements ICanvasTransforms
{
    public constructor
    (
        public readonly clipToPixel: IReadonlyMat3<Float32Array>,
        public readonly clipToCss: IReadonlyMat3<Float32Array>,
        public readonly pixelToClip: IReadonlyMat3<Float32Array>,
        public readonly cssToClip: IReadonlyMat3<Float32Array>,
    )
    {
    }
}
