import { IReadonlyRange2d, IReadonlyVec2, Mat3, TTypedArray, Vec2 } from "rc-js-util";
import { ICartesian2dPlotRange } from "../update/update-arg/cartesian2d-plot-range";
import { IReadonlyPlot } from "@visualization-tools/core";

/**
 * @internal
 */
export class CartesianUserInteractionTransformProvider<TArray extends TTypedArray>
{
    public constructor
    (
        private readonly plot: IReadonlyPlot<ICartesian2dPlotRange<TArray>, unknown>,
    )
    {
        this.tmpVec2 = plot.plotRange.dataRange
            .getRow(0)
            .fill(0);
        this.tmp2Vec2 = plot.plotRange.dataRange
            .getRow(0)
            .fill(0);
        this.tmpMat3 = plot.plotRange.dataRange
            .getRangeTransform(plot.plotRange.dataRange)
            .fill(0);
    }

    /**
     * Transforms `position` into the `transformedDataRange` relative to `positionRange`.
     */
    public getTransformedPosition
    (
        position: IReadonlyVec2<TArray>,
        positionRange: IReadonlyRange2d<TArray>,
    )
        : IReadonlyVec2<TArray>
    {
        // ut - user transform
        const plotRange = this.plot.plotRange;
        const positionToUtData = positionRange.getRangeTransform(plotRange.transformedDataRange, this.tmpMat3);
        return position.mat3Multiply(positionToUtData, this.tmpVec2);
    }

    public getTransformedDelta
    (
        position: IReadonlyVec2<TArray>,
        positionRange: IReadonlyRange2d<TArray>,
        dx: number,
        dy: number,
    )
        : IReadonlyVec2<TArray>
    {
        const plotRange = this.plot.plotRange;
        const positionToUtData = positionRange.getRangeTransform(plotRange.transformedDataRange, this.tmpMat3);
        this.tmp2Vec2.update(dx, dy);
        position.subtract(this.tmp2Vec2, this.tmp2Vec2);

        // position before and after in user transform space
        this.tmp2Vec2.mat3Multiply(positionToUtData, this.tmpVec2);
        position.mat3Multiply(positionToUtData, this.tmp2Vec2);

        plotRange.userTransform.reverseTransformPoint(this.tmpVec2, this.tmpVec2);
        plotRange.userTransform.reverseTransformPoint(this.tmp2Vec2, this.tmp2Vec2);

        return this.tmpVec2.subtract(this.tmp2Vec2, this.tmpVec2);
    }

    private readonly tmpMat3: Mat3<TArray>;
    private readonly tmpVec2: Vec2<TArray>;
    private readonly tmp2Vec2: Vec2<TArray>;
}