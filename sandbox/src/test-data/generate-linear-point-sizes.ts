import { IDrawablePoint2dOffsets } from "@visualization-tools/cartesian-2d";
import { IIndexedDataConnector } from "@visualization-tools/core";
import { TF32Vec2 } from "rc-js-util";

export function generateLinearPointSizes
(
    range: TF32Vec2,
    writeTo: IIndexedDataConnector<IDrawablePoint2dOffsets>,
    sizeOffset: number,
)
    : void
{
    const increment = (range.getY() - range.getX()) / (writeTo.getLength() - 1);
    const xMin = range.getX();

    for (let i = writeTo.getStart(), iEnd = writeTo.getEnd(); i < iEnd; ++i)
    {
        const x = xMin + increment * i;
        writeTo.setValue(i, sizeOffset, x);
    }
}