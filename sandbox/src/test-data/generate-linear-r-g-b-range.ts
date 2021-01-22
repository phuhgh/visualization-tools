import { IDrawablePoint2dOffsets } from "@visualization-tools/cartesian-2d";
import { IIndexedDataConnector } from "@visualization-tools/core";
import { ERgbaShift } from "rc-js-util";

export function generateLinearRGBRange
(
    min: number,
    max: number,
    writeTo: IIndexedDataConnector<IDrawablePoint2dOffsets>,
    colorOffset: number,
)
    : void
{
    const _ERgbaShift = ERgbaShift;
    const rStep = getColorStepSize(min, max, _ERgbaShift.R, writeTo.getLength() - 1);
    const gStep = getColorStepSize(min, max, _ERgbaShift.G, writeTo.getLength() - 1);
    const bStep = getColorStepSize(min, max, _ERgbaShift.B, writeTo.getLength() - 1);

    for (let i = writeTo.getStart(), iEnd = writeTo.getEnd(); i < iEnd; ++i)
    {
        let color = incrementColorChannel(min, _ERgbaShift.R, rStep * i);
        color = incrementColorChannel(color, _ERgbaShift.G, gStep * i);
        color = incrementColorChannel(color, _ERgbaShift.B, bStep * i);
        writeTo.setValue(i, colorOffset, color);
    }
}

function getColorStepSize(min: number, max: number, shift: number, stepCount: number): number
{
    const mask = 0xFF << shift;
    const range = ((max & mask) >>> shift) - ((min & mask) >>> shift);
    return range / stepCount;
}

function incrementColorChannel(color: number, shift: number, step: number): number
{
    const mask = 0xFF << shift;
    const channel = ((color & mask) >>> shift) + step;
    color &= ~mask;

    return color | (channel << shift);
}