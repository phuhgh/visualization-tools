import { ICanvasDimensions } from "../../templating/canvas-dimensions";

/**
 * @public
 */
export type IPlotEventTargetProvider<TTargets extends object> =
    & { update(canvasDims: ICanvasDimensions, startTime: number): IterableIterator<void>; }
    & TTargets
    ;