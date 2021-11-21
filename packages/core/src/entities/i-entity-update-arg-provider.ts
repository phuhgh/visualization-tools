import { ICanvasDimensions } from "../templating/canvas-dimensions";
import { IReadonlyPlot } from "../plot/i-plot";
import { IPlotRange } from "../plot/i-plot-range";

/**
 * @public
 */
export interface IEntityUpdateArgProvider<TPlotRange extends IPlotRange, TUpdateArg, TRequiredTraits>
{
    getUpdateArg(plot: IReadonlyPlot<TPlotRange, TRequiredTraits>, canvasDims: ICanvasDimensions): TUpdateArg;
}