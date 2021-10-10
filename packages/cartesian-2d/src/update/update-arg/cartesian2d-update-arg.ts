import { IReadonlyRange2d, Range2d, TTypedArray, TTypedArrayCtor } from "rc-js-util";
import { Cartesian2dTransforms, ICartesian2dTransforms } from "./cartesian2d-transforms";
import { ICartesian2dPlotRange } from "./cartesian2d-plot-range";
import { CanvasDimensions, ICanvasDimensions, IPlotDimensions, IReadonlyPlot, PlotDimensions } from "@visualization-tools/core";
import { ICartesian2dUserTransform } from "../user-transforms/i-cartesian2d-user-transform";
import { Cartesian2dIdentityTransform } from "../user-transforms/cartesian2d-identity-transform";

/**
 * @public
 * Update arg provided by {@link ICartesian2dUpdateArg}.
 */
export interface ICartesian2dUpdateArg<TArray extends TTypedArray>
{
    /**
     * In data space.
     */
    readonly plotRange: IReadonlyRange2d<TArray>;
    readonly transformedDataRange: IReadonlyRange2d<TArray>;

    readonly userTransform: ICartesian2dUserTransform<TArray>;
    readonly drawTransforms: ICartesian2dTransforms<TArray>;
    readonly interactionTransforms: ICartesian2dTransforms<TArray>;
    readonly canvasDimensions: ICanvasDimensions;
    /**
     * Origin bottom left (OBL).
     */
    readonly plotDimensionsOBL: IPlotDimensions;
    /**
     * Origin top left (OTL).
     */
    readonly plotDimensionsOTL: IPlotDimensions;
}

/**
 * @public
 * {@inheritDoc ICartesian2dUpdateArg}
 */
export class Cartesian2dUpdateArg<TCtor extends TTypedArrayCtor> implements ICartesian2dUpdateArg<InstanceType<TCtor>>
{
    public plotRange: IReadonlyRange2d<InstanceType<TCtor>>;
    public transformedDataRange: IReadonlyRange2d<InstanceType<TCtor>>;
    public userTransform: ICartesian2dUserTransform<InstanceType<TCtor>>;
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
        const range2dFactory = Range2d.getCtor(ctor).factory;
        this.plotRange = range2dFactory.createOneEmpty();
        this.transformedDataRange = range2dFactory.createOneEmpty();
        this.userTransform = new Cartesian2dIdentityTransform();
        this.drawTransforms = new Cartesian2dTransforms(ctor);
        this.interactionTransforms = new Cartesian2dTransforms(ctor);
        this.canvasDimensions = CanvasDimensions.createDefault();
        this.plotDimensionsOBL = PlotDimensions.createDefault();
        this.plotDimensionsOTL = PlotDimensions.createDefault();
    }

    public update(plot: IReadonlyPlot<ICartesian2dPlotRange<InstanceType<TCtor>>, unknown>, canvasDims: ICanvasDimensions): void
    {
        this.userTransform = plot.plotRange.userTransform;
        this.plotRange = plot.plotRange.dataRange;
        this.transformedDataRange = plot.plotRange.transformedDataRange;
        this.plotDimensionsOBL = plot.plotDimensionsOBL;
        this.plotDimensionsOTL = plot.plotDimensionsOTL;
        this.canvasDimensions = canvasDims;
        // drawTransforms is specific to the drawing technology so is updated elsewhere
        this.interactionTransforms.update(
            this.transformedDataRange,
            plot.plotDimensionsOBL.cssArea.wholeRange,
            plot.plotDimensionsOBL.cssArea.interactiveRange,
        );
    }
}