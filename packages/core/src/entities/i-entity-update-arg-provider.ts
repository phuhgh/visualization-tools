import { ICanvasDimensions } from "../templating/canvas-dimensions";
import { IReadonlyPlot } from "../plot/i-plot";

/**
 * @public
 */
export interface IEntityUpdateArgProvider<TPlotRange, TUpdateArg, TRequiredTraits>
{
    getUpdateArg(plot: IReadonlyPlot<TPlotRange, TRequiredTraits>, canvasDims: ICanvasDimensions): TUpdateArg;
}