import { _F32, _F64, _Math, IReadonlyRange2d, Range2d, TTypedArray } from "rc-js-util";
import { ICanvasDimensions, IPlotRange } from "@visualization-tools/core";
import { Cartesian2dFloatPrecisionRangeBounder } from "../../eventing/cartesian2d-float-precision-range-bounder";
import { ICartesian2dInteractionBounder } from "../../eventing/i-cartesian2d-interaction-bounder";
import { ICartesian2dUserTransform } from "../user-transforms/i-cartesian2d-user-transform";

/**
 * @public
 */
export interface ICartesian2dPlotConstructorOptions<TArray extends TTypedArray>
{
    maxBounds: Range2d<TArray>,
    dataRange: Range2d<TArray>,
    maxZoom: number,
    userTransform: ICartesian2dUserTransform,
}

/**
 * @public
 * Cartesian 2d data range, range is bounded by {@link Cartesian2dInteractionHandler}.
 */
export interface ICartesian2dPlotRange<TArray extends TTypedArray> extends IPlotRange
{
    readonly userTransform: ICartesian2dUserTransform;
    /**
     * The range to be drawn.
     */
    readonly dataRange: IReadonlyRange2d<TArray>;
    /**
     * `dataRange` after `userTransform` has been applied.
     */
    readonly transformedDataRange: IReadonlyRange2d<TArray>;
    /**
     * Prevent panning / zooming past these bounds.
     */
    readonly maxBounds: IReadonlyRange2d<TArray>;
    /**
     * The data range may not span less than this range.
     */
    readonly minRange: IReadonlyRange2d<TArray>;

    updateDataRange(dataRange: IReadonlyRange2d<TArray>): void;

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

    updateUserTransform(userTransform: ICartesian2dUserTransform): void;
}

/**
 * @public
 * {@inheritDoc ICartesian2dPlotRange}
 */
export class Cartesian2dPlotRange<TArray extends TTypedArray>
    implements ICartesian2dPlotRange<TArray>
{
    public isDirty: boolean = true;
    public dataRange: Range2d<TArray>;
    public transformedDataRange: IReadonlyRange2d<TArray>;
    public maxBounds: Range2d<TArray>;
    public minRange: Range2d<TArray>;
    public userTransform: ICartesian2dUserTransform;

    public static createOneF32
    (
        options: ICartesian2dPlotConstructorOptions<Float32Array>,
    )
        : ICartesian2dPlotRange<Float32Array>
    {
        return new Cartesian2dPlotRange(
            options.maxBounds,
            options.dataRange,
            options.maxZoom,
            new Cartesian2dFloatPrecisionRangeBounder(_F32, 0.1),
            options.userTransform,
        );
    }

    public static createOneF64
    (
        options: ICartesian2dPlotConstructorOptions<Float64Array>,
    )
        : ICartesian2dPlotRange<Float64Array>
    {
        return new Cartesian2dPlotRange(
            options.maxBounds,
            options.dataRange,
            options.maxZoom,
            new Cartesian2dFloatPrecisionRangeBounder(_F64, 0.1),
            options.userTransform,
        );
    }

    protected constructor
    (
        maxBounds: Range2d<TArray>,
        dataRange: Range2d<TArray>,
        maxZoom: number,
        interactionBounder: ICartesian2dInteractionBounder<TArray>,
        userTransform: ICartesian2dUserTransform,
    )
    {
        this.userTransform = userTransform;
        this.interactionBounder = interactionBounder;
        this.maxBounds = maxBounds;
        this.dataRange = dataRange;
        this.minRange = dataRange
            .slice()
            .fill(0);
        this.updateBounds(maxBounds, maxZoom);
        this.transformedDataRange = this.userTransform.forwardTransformRange(dataRange);
    }

    public updateDataRange(unclampedDataRange: IReadonlyRange2d<TArray>): void
    {
        this.dataRange.set(unclampedDataRange);
        this.isDirty = true;
    }

    public updateBounds(bounds: IReadonlyRange2d<TArray>, maxZoom: number): void
    {
        maxZoom = _Math.bound(maxZoom, 1, this.interactionBounder.maxZoom);
        this.maxBounds.set(bounds);
        this.maxBounds.bound(this.interactionBounder.maxBounds);
        this.minRange.update(0, bounds.getXRange() / maxZoom, 0, bounds.getYRange() / maxZoom);
        this.isDirty = true;
    }

    public updateUserTransform(userTransform: ICartesian2dUserTransform): void
    {
        this.userTransform = userTransform;
        this.transformedDataRange = this.userTransform.forwardTransformRange(this.dataRange);
    }

    public update(canvasDims: ICanvasDimensions): void
    {
        if (!this.isDirty)
        {
            return;
        }

        this.dataRange.ensureMinRange(this.minRange.getXMax(), this.minRange.getYRange());
        this.interactionBounder.boundRange(this.dataRange, canvasDims.pixelDims, this.maxBounds);
        this.userTransform.forwardTransformRange(this.dataRange, this.transformedDataRange as Range2d<TArray>);
    }

    private interactionBounder: ICartesian2dInteractionBounder<TArray>;
}