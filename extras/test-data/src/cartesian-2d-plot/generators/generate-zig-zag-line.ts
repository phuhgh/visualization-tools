import { IDrawablePoint2dOffsets } from "@visualization-tools/cartesian-2d";
import { IIndexedDataConnector } from "@visualization-tools/core";
import { IReadonlyRange2d, TTypedArray } from "rc-js-util";

export function generateZigZagLine
(
    writeTo: IIndexedDataConnector<IDrawablePoint2dOffsets>,
    range: IReadonlyRange2d<TTypedArray>,
)
    : void
{
    const increment = range.getXRange() / (writeTo.getLength() - 1);
    const xMin = range.getXMin();
    const yMin = range.getYMin();
    const yMax = range.getYMax();
    const xOffset = writeTo.offsets.x;
    const yOffset = writeTo.offsets.y;

    for (let i = writeTo.getStart(), iEnd = writeTo.getEnd(); i < iEnd; ++i)
    {
        const x = xMin + increment * i;
        writeTo.setValue(i, xOffset, x);
        if (i % 2 === 0)
        {
            writeTo.setValue(i, yOffset, yMin);
        }
        else
        {
            writeTo.setValue(i, yOffset, yMax);
        }
    }
}


