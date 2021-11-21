import { IReadonlyMat3, IReadonlyRange2d, Range2d } from "rc-js-util";
import { fullClipSpaceRange2d } from "../transforms/full-clip-space-range2d";
import { fullClipSpaceSize2d } from "../transforms/full-clip-space-size2d";
import { reverseYFullClipSpaceRange2d } from "../transforms/reverse-y-full-clip-space-range2d";
import { CanvasTransforms, ICanvasTransforms } from "./canvas-transforms";

/**
 * @public
 * Canvas element dimensions and useful transforms.
 */
export interface ICanvasDimensions
{
    /**
     * Device pixel ratio.
     */
    readonly dpr: number;
    readonly cssDims: IReadonlyRange2d<Float32Array>;
    readonly pixelDims: IReadonlyRange2d<Float32Array>;
    readonly boundingRect: IReadonlyRange2d<Float32Array>;

    /**
     * Origin bottom left.
     */
    readonly transforms: ICanvasTransforms;

    /**
     * Origin top left.
     */
    readonly reverseYTransforms: ICanvasTransforms;

    readonly pixelToClipSize: IReadonlyMat3<Float32Array>;

    clone(): ICanvasDimensions;
    updateBoundingRects(boundingRect: DOMRect): void;
}

/**
 * @public
 * {@inheritDoc ICanvasDimensions}
 */
export class CanvasDimensions implements ICanvasDimensions
{
    public readonly transforms: ICanvasTransforms;
    public readonly reverseYTransforms: ICanvasTransforms;
    public readonly pixelToClipSize: IReadonlyMat3<Float32Array>;

    public constructor
    (
        public readonly dpr: number,
        public readonly cssDims: IReadonlyRange2d<Float32Array>,
        public readonly pixelDims: IReadonlyRange2d<Float32Array>,
        public readonly boundingRect: Range2d<Float32Array>,
    )
    {
        this.transforms = new CanvasTransforms(
            fullClipSpaceRange2d.getRangeTransform(pixelDims),
            fullClipSpaceRange2d.getRangeTransform(cssDims),
            pixelDims.getRangeTransform(fullClipSpaceRange2d),
            cssDims.getRangeTransform(fullClipSpaceRange2d),
        );
        this.reverseYTransforms = new CanvasTransforms(
            reverseYFullClipSpaceRange2d.getRangeTransform(pixelDims),
            reverseYFullClipSpaceRange2d.getRangeTransform(cssDims),
            pixelDims.getRangeTransform(reverseYFullClipSpaceRange2d),
            cssDims.getRangeTransform(reverseYFullClipSpaceRange2d),
        );

        this.pixelToClipSize = pixelDims.getRangeTransform(fullClipSpaceSize2d);
    }

    public updateBoundingRects(boundingRect: DOMRect): void
    {
        this.boundingRect.update(boundingRect.left, boundingRect.right, boundingRect.top, boundingRect.bottom);
    }

    public static createDefault(): ICanvasDimensions
    {
        return new CanvasDimensions(
            1,
            Range2d.f32.factory.createOne(0, 300, 0, 300),
            Range2d.f32.factory.createOne(0, 300, 0, 300),
            Range2d.f32.factory.createOne(0, 300, 0, 300),
        );
    }

    public clone(): ICanvasDimensions
    {
        return new CanvasDimensions(
            this.dpr,
            this.pixelDims,
            this.pixelDims,
            this.boundingRect,
        );
    }
}
