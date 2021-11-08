import { ICanvasDimensions } from "../templating/canvas-dimensions";

/**
 * @public
 * Base plot range.
 */
export interface IPlotRange
{
    isDirty: boolean;

    update(canvasDims: ICanvasDimensions): void;
}