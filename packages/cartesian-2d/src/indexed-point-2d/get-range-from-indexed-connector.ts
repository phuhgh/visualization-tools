import { IIndexedDataConnector } from "@visualization-tools/core";
import { Range1d, TTypedArray } from "rc-js-util";
import { IDrawablePoint2dOffsets } from "../series/i-drawable-point2d-offsets";

/**
 * @public
 * Provides the AABB (in data space) of an indexed point connector. The last parameter is an optional out parameter, if
 * not supplied F64 will be assumed.
 */
export function getRangeFromIndexedConnector<TArray extends TTypedArray = Float64Array>
(
    connector: IIndexedDataConnector<IDrawablePoint2dOffsets>,
    result: Range1d<TArray> = new Range1d.f64() as Range1d<TArray>,
)
    : Range1d<TArray> | null
{
    const sizeOffset = connector.offsets.size;

    if (sizeOffset == null)
    {
        return null;
    }

    for (let i = connector.getStart(), iEnd = connector.getEnd(); i < iEnd; ++i)
    {
        result.extendRange(connector.getValue(i, sizeOffset), result);
    }

    return result;
}