import { _F32, _F64, _Math, IReadonlyRange2d, Range2d, TTypedArray } from "rc-js-util";
import { ICanvasDimensions } from "@visualization-tools/core";
import { Cartesian2dFloatPrecisionRangeBounder } from "../eventing/cartesian2d-float-precision-range-bounder";
import { ICartesian2dInteractionBounder } from "../eventing/i-cartesian2d-interaction-bounder";

/**
 * @public
 * Cartesian 2d data range, range is bounded by {@link Cartesian2dInteractionHandler}.
 */
export interface ICartesian2dPlotRange<TArray extends TTypedArray>
{
    /**
     * The range to be drawn.
     */
    dataRange: IReadonlyRange2d<TArray>;
    /**
     * Prevent panning / zooming past these bounds.
     */
    maxBounds: IReadonlyRange2d<TArray>;
    /**
     * The data range may not span less than this range.
     */
    minRange: IReadonlyRange2d<TArray>;

    updateDataRange
    (
        dataRange: IReadonlyRange2d<TArray>,
        canvasDims: ICanvasDimensions,
    )
        : void;

    /**
     * @param bounds - Defines the max extent of the plot, will be modified.
     * @param maxZoom - The max bounds will be divided by this value to determine the maximum zoom.
     */
    updateBounds
    (
        bounds: IReadonlyRange2d<TArray>,
        maxZoom: number,
    )
        : void;
}

/**
 * @public
 * {@inheritDoc ICartesian2dPlotRange}
 */
export class Cartesian2dPlotRange<TArray extends TTypedArray>
    implements ICartesian2dPlotRange<TArray>
{
    public dataRange: Range2d<TArray>;
    public maxBounds: Range2d<TArray>;
    public minRange: Range2d<TArray>;

    public static createOneF32
    (
        maxBounds: Range2d<Float32Array>,
        dataRange: Range2d<Float32Array>,
        maxZoom: number,
        canvasDims: ICanvasDimensions,
    )
        : ICartesian2dPlotRange<Float32Array>
    {
        return new Cartesian2dPlotRange(maxBounds, dataRange, maxZoom, canvasDims, new Cartesian2dFloatPrecisionRangeBounder(_F32, 0.1));
    }

    public static createOneF64
    (
        maxBounds: Range2d<Float64Array>,
        dataRange: Range2d<Float64Array>,
        maxZoom: number,
        canvasDims: ICanvasDimensions,
    )
        : ICartesian2dPlotRange<Float64Array>
    {
        return new Cartesian2dPlotRange(maxBounds, dataRange, maxZoom, canvasDims, new Cartesian2dFloatPrecisionRangeBounder(_F64, 0.1));
    }

    protected constructor
    (
        maxBounds: Range2d<TArray>,
        dataRange: Range2d<TArray>,
        maxZoom: number,
        canvasDims: ICanvasDimensions,
        interactionBounder: ICartesian2dInteractionBounder<TArray>,
    )
    {
        this.interactionBounder = interactionBounder;
        this.maxBounds = maxBounds;
        this.dataRange = dataRange;
        this.minRange = dataRange
            .slice()
            .fill(0);
        this.updateBounds(maxBounds, maxZoom);
        this.updateDataRange(dataRange, canvasDims);
    }

    public updateDataRange
    (
        dataRange: IReadonlyRange2d<TArray>,
        canvasDims: ICanvasDimensions,
    )
        : void
    {
        this.dataRange.set(dataRange);
        this.dataRange.ensureMinRange(this.minRange.getXMax(), this.minRange.getYRange());
        this.interactionBounder.boundRange(this.dataRange, canvasDims.pixelDims, this.maxBounds);
    }

    public updateBounds
    (
        bounds: IReadonlyRange2d<TArray>,
        maxZoom: number,
    )
        : void
    {
        maxZoom = _Math.bound(maxZoom, 1, this.interactionBounder.maxZoom);

        this.maxBounds.set(bounds);
        this.maxBounds.bound(this.interactionBounder.maxBounds);
        this.minRange.update(0, bounds.getXRange() / maxZoom, 0, bounds.getYRange() / maxZoom);
        this.minRange.setXMax(bounds.getXRange() / maxZoom);
        this.minRange.setYMax(bounds.getYRange() / maxZoom);
    }

    private interactionBounder: ICartesian2dInteractionBounder<TArray>;
}