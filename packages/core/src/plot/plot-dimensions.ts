import { IPlotArea, PlotArea } from "./i-plot-area";
import { ICanvasDimensions } from "../templating/canvas-dimensions";
import { Range2d } from "rc-js-util";

/**
 * @public
 * The space a plot takes up on a chart in various coordinate systems.
 */
export interface IPlotDimensions
{
    readonly clipSpaceArea: IPlotArea;
    readonly cssArea: IPlotArea;
    readonly pixelArea: IPlotArea;
}

/**
 * @public
 * {@inheritDoc IPlotDimensions}
 */
export class PlotDimensions implements IPlotDimensions
{
    /**
     * Origin bottom left (OBL).
     */
    public static createOneOBL
    (
        clipSpaceRange: IPlotArea,
        canvasDims: ICanvasDimensions,
    )
        : IPlotDimensions
    {
        return new PlotDimensions(
            clipSpaceRange,
            new PlotArea(
                clipSpaceRange.wholeRange.mat3Multiply(canvasDims.transforms.clipToCss),
                clipSpaceRange.interactiveRange.mat3Multiply(canvasDims.transforms.clipToCss),
            ),
            new PlotArea(
                clipSpaceRange.wholeRange.mat3Multiply(canvasDims.transforms.clipToPixel),
                clipSpaceRange.interactiveRange.mat3Multiply(canvasDims.transforms.clipToPixel),
            ),
        );
    }

    /**
     * Origin top left (OTL).
     */
    public static createOneOTL
    (
        clipSpaceRange: IPlotArea,
        canvasDims: ICanvasDimensions,
    )
        : IPlotDimensions
    {
        const dims = new PlotDimensions(
            clipSpaceRange,
            new PlotArea(
                clipSpaceRange.wholeRange.mat3Multiply(canvasDims.reverseYTransforms.clipToCss),
                clipSpaceRange.interactiveRange.mat3Multiply(canvasDims.reverseYTransforms.clipToCss),
            ),
            new PlotArea(
                clipSpaceRange.wholeRange.mat3Multiply(canvasDims.reverseYTransforms.clipToPixel),
                clipSpaceRange.interactiveRange.mat3Multiply(canvasDims.reverseYTransforms.clipToPixel),
            ),
        );

        // the y range is upside down,correct it
        (dims.cssArea.interactiveRange as Range2d<Float32Array>).ensureAABB();
        (dims.cssArea.wholeRange as Range2d<Float32Array>).ensureAABB();
        (dims.pixelArea.interactiveRange as Range2d<Float32Array>).ensureAABB();
        (dims.pixelArea.wholeRange as Range2d<Float32Array>).ensureAABB();

        return dims;
    }

    public static createDefault(): IPlotDimensions
    {
        return new PlotDimensions(
            PlotArea.createDefault(),
            PlotArea.createDefault(),
            PlotArea.createDefault(),
        );
    }

    public constructor
    (
        public readonly clipSpaceArea: IPlotArea,
        public readonly cssArea: IPlotArea,
        public readonly pixelArea: IPlotArea,
    )
    {
    }
}