import { Range2d, TTypedArray } from "rc-js-util";
import { IPlotRange } from "../../plot/i-plot-range";

/**
 * @internal
 */
export interface ITestPlotRange<TArray extends TTypedArray> extends IPlotRange
{
    range: Range2d<TArray>;
}