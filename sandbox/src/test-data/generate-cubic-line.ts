import { IDrawablePoint2dOffsets } from "@visualization-tools/cartesian-2d";
import { IIndexedDataConnector } from "@visualization-tools/core";
import { TF32Range2d } from "rc-js-util";

export function generateCubicLine
(
    range: TF32Range2d,
    writeTo: IIndexedDataConnector<IDrawablePoint2dOffsets>,
)
    : void
{
    const increment = range.getXRange() / (writeTo.getLength() - 1);
    const xMin = range.getXMin();
    const yMin = range.getYMin();
    const xOffset = writeTo.offsets.x;
    const yOffset = writeTo.offsets.y;

    for (let i = 0, iEnd = writeTo.getEnd(); i < iEnd; ++i)
    {
        const x = xMin + increment * i;
        writeTo.setValue(i, xOffset, x);
        writeTo.setValue(i, yOffset, yMin + x * x * x);
    }
}


