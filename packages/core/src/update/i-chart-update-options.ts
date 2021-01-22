/**
 * @public
 * Options for how to update plots, like whether updating one plot requires updating all other plots.
 */
export interface IChartUpdateOptions
{
    /**
     * When one plot is drawn, should all others be redrawn?
     * This is not necessary for a canvas renderer, or where a gl context is created with `preserveDrawingBuffer`.
     */
    readonly updateAllPlotsOnDraw: boolean;
    /**
     * On each draw should the viewport be adjusted to reflect the dimensions of the canvas?
     * Where your application provides hooks for resize, this can be disabled for a minor performance win.
     */
    readonly updateDimsOnDraw: boolean;
    /**
     * How long to wait after a draw before beginning updating the plot(s) interaction handlers. Default 500 ms.
     */
    readonly interactionRollupTime: number,
}