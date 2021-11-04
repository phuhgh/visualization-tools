import { IDrawablePoint2dOffsets } from "@visualization-tools/cartesian-2d";
import { IIndexedDataConnector } from "@visualization-tools/core";
import { _Debug, Margin2d, Range2d, TTypedArray } from "rc-js-util";

export function generateRect
(
    writeTo: IIndexedDataConnector<IDrawablePoint2dOffsets>,
    range: Range2d<TTypedArray>,
)
    : void
{
    DEBUG_MODE && _Debug.assert(range.getXRange() > 1 && range.getYRange() > 1, "range to small to generate padded rect");
    const paddedRange = Margin2d.f64.factory
        .createOne(1, 1, 1, 1)
        .getInnerRange(range);

    writeTo.setLength(5);

    const xMin = paddedRange.getXMin();
    const xMax = paddedRange.getXMax();
    const yMin = paddedRange.getYMin();
    const yMax = paddedRange.getYMax();
    const xOffset = writeTo.offsets.x;
    const yOffset = writeTo.offsets.y;

    writeTo.setValue(0, xOffset, xMin);
    writeTo.setValue(0, yOffset, yMin);

    writeTo.setValue(1, xOffset, xMax);
    writeTo.setValue(1, yOffset, yMin);

    writeTo.setValue(2, xOffset, xMax);
    writeTo.setValue(2, yOffset, yMax);

    writeTo.setValue(3, xOffset, xMin);
    writeTo.setValue(3, yOffset, yMax);

    writeTo.setValue(4, xOffset, xMin);
    writeTo.setValue(4, yOffset, yMin);
}


