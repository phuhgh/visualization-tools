import { Range1d, TTypedArray } from "rc-js-util";
import { IDataTrait, IEntityChangeHooks, IIndexedDataConnector } from "@visualization-tools/core";
import { getRangeFromIndexedConnector } from "../../indexed-point-2d/get-range-from-indexed-connector";
import { Point2dSizeNormalizer } from "../../traits/t-point2d-size-normalizer-trait";
import { IDrawablePoint2dOffsets } from "../../series/i-drawable-point2d-offsets";

/**
 * @public
 * Membership hooks for 2d points, normalizes point display size.
 */
export class Point2dSubcategory<TArray extends TTypedArray>
    implements IEntityChangeHooks<IDataTrait<IIndexedDataConnector<IDrawablePoint2dOffsets>>>
{
    public normalization: Point2dSizeNormalizer<TArray>;

    public constructor
    (
        pixelSizeRange: Range1d<TArray>,
    )
    {
        this.normalization = new Point2dSizeNormalizer(pixelSizeRange);
    }

    public onEntityAdded(entity: IDataTrait<IIndexedDataConnector<IDrawablePoint2dOffsets>>): void
    {
        const range = getRangeFromIndexedConnector(entity.data);

        if (range != null)
        {
            this.normalization.extendDataRange(range.getMin(), range.getMax());
        }
    }

    public onEntityRemoved(): void
    {
        // no way to lower range from here
    }
}