import { ICanvasDimensions } from "../templating/canvas-dimensions";

export interface IPlotRange
{
    isDirty: boolean;

    update(canvasDims: ICanvasDimensions): void;
}