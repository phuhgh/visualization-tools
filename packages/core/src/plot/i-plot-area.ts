import { IReadonlyMargin2d, IReadonlyRange2d } from "rc-js-util";
import { fullClipSpaceRange2d } from "../transforms/full-clip-space-range2d";

/**
 * @public
 * The space a plot takes up on a chart.
 */
export interface IPlotArea
{
    /**
     * In clip space, includes any axis etc if present.
     */
    readonly wholeRange: IReadonlyRange2d<Float32Array>;
    /**
     * In clip space, must be equivalent to data area for interaction handlers to work.
     */
    readonly interactiveRange: IReadonlyRange2d<Float32Array>;
}

/**
 * @public
 * {@inheritDoc IPlotArea}
 */
export class PlotArea implements IPlotArea
{
    public static createOneWithMargins
    (
        wholeArea: IReadonlyRange2d<Float32Array>,
        margins: IReadonlyMargin2d<Float32Array>,
    )
        : IPlotArea
    {
        const interactiveArea = margins.getInnerRange(wholeArea);

        return new PlotArea(
            wholeArea,
            interactiveArea,
        );
    }

    public static createDefault(): IPlotArea
    {
        return new PlotArea(fullClipSpaceRange2d.slice(), fullClipSpaceRange2d.slice());
    }

    public constructor
    (
        public readonly wholeRange: IReadonlyRange2d<Float32Array>,
        public readonly interactiveRange: IReadonlyRange2d<Float32Array>,
    )
    {
    }
}