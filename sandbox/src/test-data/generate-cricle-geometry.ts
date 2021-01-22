import { IDrawablePoint2dOffsets } from "@visualization-tools/cartesian-2d";
import { IIndexedDataConnector } from "@visualization-tools/core";
import { _Math, IRandomNumberGenerator, Range2d, TTypedArray } from "rc-js-util";

export function generateCircleGeometry
(
    writeTo: IIndexedDataConnector<IDrawablePoint2dOffsets>,
    range: Range2d<TTypedArray>,
    rnd: IRandomNumberGenerator,
)
    : void
{
    const increment = 2 * Math.PI / (writeTo.getLength() - 1);
    const xMin = range.getXMin();
    const yMin = range.getYMin();
    const sf = _Math.min(range.getXRange(), range.getYRange()) * rnd.getNext();

    for (let i = writeTo.getStart(); i < writeTo.getEnd(); ++i)
    {
        const step = increment * i;
        writeTo.setValue(i, writeTo.offsets.x, xMin + Math.cos(step) * sf);
        writeTo.setValue(i, writeTo.offsets.y, yMin + Math.sin(step) * sf);
    }
}