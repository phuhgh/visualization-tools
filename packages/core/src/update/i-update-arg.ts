import { ICanvasDimensions } from "../templating/canvas-dimensions";
import { IUserTransform } from "../plot/i-user-transform";

/**
 * @public
 * Base update arg for components, dimension agnostic.
 */
export interface IUpdateArg
{
    canvasDimensions: ICanvasDimensions;
    userTransform: IUserTransform;
}