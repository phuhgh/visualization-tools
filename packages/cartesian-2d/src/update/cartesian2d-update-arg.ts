import { IReadonlyRange2d, Range2d, TTypedArray, TTypedArrayCtor } from "rc-js-util";
import { Cartesian2dTransforms, ICartesian2dTransforms } from "./cartesian2d-transforms";
import { ICartesian2dPlotRange } from "./cartesian2d-plot-range";
import { CanvasDimensions, ICanvasDimensions, IPlotDimensions, IReadonlyPlot, PlotDimensions } from "@visualization-tools/core";

/**
 * @public
 * Update arg provided by {@link ICartesian2dUpdateArg}.
 */
export interface ICartesian2dUpdateArg<TArray extends TTypedArray>
{
    /**
     * In data space.
     */
    plotRange: IReadonlyRange2d<TArray>;
    drawTransforms: ICartesian2dTransforms<TArray>;
    interactionTransforms: ICartesian2dTransforms<TArray>;
    canvasDimensions: ICanvasDimensions;
    /**
     * Origin bottom left (OBL).
     */
    plotDimensionsOBL: IPlotDimensions;
    /**
     * Origin top left (OTL).
     */
    plotDimensionsOTL: IPlotDimensions;
}

/**
 * @public
 * {@inheritDoc ICartesian2dUpdateArg}
 */
export class Cartesian2dUpdateArg<TCtor extends TTypedArrayCtor> implements ICartesian2dUpdateArg<InstanceType<TCtor>>
{
    public plotRange: IReadonlyRange2d<InstanceType<TCtor>>;
    public drawTransforms: ICartesian2dTransforms<InstanceType<TCtor>>;
    public interactionTransforms: ICartesian2dTransforms<InstanceType<TCtor>>;
    public canvasDimensions: ICanvasDimensions;
    public plotDimensionsOBL: IPlotDimensions;
    public plotDimensionsOTL: IPlotDimensions;

    public constructor
    (
        ctor: TCtor,
    )
    {
        this.plotRange = Range2d.getCtor(ctor).factory.createOneEmpty();
        this.drawTransforms = new Cartesian2dTransforms(ctor);
        this.interactionTransforms = new Cartesian2dTransforms(ctor);
        this.canvasDimensions = CanvasDimensions.createDefault();
        this.plotDimensionsOBL = PlotDimensions.createDefault();
        this.plotDimensionsOTL = PlotDimensions.createDefault();
    }

    public update(plot: IReadonlyPlot<ICartesian2dPlotRange<InstanceType<TCtor>>, unknown>, canvasDims: ICanvasDimensions): void
    {
        this.plotRange = plot.plotRange.dataRange;
        this.plotDimensionsOBL = plot.plotDimensionsOBL;
        this.plotDimensionsOTL = plot.plotDimensionsOTL;
        this.canvasDimensions = canvasDims;
        // drawTransforms is specific to the drawing technology so is updated elsewhere
        this.interactionTransforms.update(
            plot.plotRange.dataRange,
            plot.plotDimensionsOBL.cssArea.wholeRange,
            plot.plotDimensionsOBL.cssArea.interactiveRange,
        );
    }
}