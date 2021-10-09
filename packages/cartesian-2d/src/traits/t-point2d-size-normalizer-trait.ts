import { IReadonlyMat2, Mat2, Range1d, TTypedArray } from "rc-js-util";
import { IGraphicsComponentSettingsTrait } from "@visualization-tools/core";

/**
 * @public
 * Normalizes the arbitrary data point size into a screen space display size.
 */
export class Point2dSizeNormalizer<TArray extends TTypedArray>
{
    public constructor
    (
        private readonly pixelSizeRange: Range1d<TArray>,
    )
    {
        this.tmpRange = pixelSizeRange.slice();
        this.sizeRange = pixelSizeRange.slice();
        this.sizeRange.update(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY);
        this.transform = this.sizeRange.getRangeTransform(this.pixelSizeRange);
        this.requiresInitialization = true;
    }

    public getSizeToPixelTransform(): IReadonlyMat2<TArray>
    {
        if (this.requiresInitialization)
        {
            this.sizeRange.getRangeTransform(this.pixelSizeRange, this.transform as Mat2<TArray>);
            this.requiresInitialization = false;
        }

        return this.transform;
    }

    public extendDataRange(min: number, max: number): void
    {
        this.tmpRange.update(min, max);
        this.sizeRange.unionRange(this.tmpRange, this.sizeRange);
        this.requiresInitialization = true;
    }

    private readonly transform: IReadonlyMat2<TArray>;
    private readonly sizeRange: Range1d<TArray>;
    private readonly tmpRange: Range1d<TArray>;
    private requiresInitialization: boolean;
}

/**
 * @public
 */
export type TPoint2dSizeNormalizer<TArray extends TTypedArray> = { pointSizeNormalizer: Point2dSizeNormalizer<TArray> };

/**
 * @public
 */
export type TPoint2dSizeNormalizerTrait<TArray extends TTypedArray> = IGraphicsComponentSettingsTrait<TPoint2dSizeNormalizer<TArray>>;
