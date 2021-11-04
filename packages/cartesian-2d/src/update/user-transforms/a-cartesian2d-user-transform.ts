import { IReadonlyRange2d, IReadonlyVec2, Range2d, TTypedArray, Vec2 } from "rc-js-util";
import { ICartesian2dUserTransform } from "./i-cartesian2d-user-transform";
import { ECartesian2dUserTransform } from "./e-cartesian2d-user-transform";

/**
 * @public
 * Provides a user transform that assumes maxes and mins will remain extrema.
 */
export abstract class ACartesian2dUserTransform<TArray extends TTypedArray>
    implements ICartesian2dUserTransform<TArray>
{
    public abstract readonly userTransformId: symbol;
    public abstract readonly transformId: ECartesian2dUserTransform;
    public abstract xTransformEnabled: boolean;
    public abstract yTransformEnabled: boolean;

    public updateTransform(xTransformEnabled: boolean, yTransformEnabled: boolean): void
    {
        this.xTransformEnabled = xTransformEnabled;
        this.yTransformEnabled = yTransformEnabled;
    }

    public abstract forwardX(x: number): number;

    public abstract forwardY(y: number): number;

    public abstract reverseX(x: number): number;

    public abstract reverseY(y: number): number;

    public forwardTransformRange
    (
        range: IReadonlyRange2d<TArray>,
        result: Range2d<TArray> = range.slice(),
    )
        : Range2d<TArray>
    {
        result[0] = this.forwardX(range[0]);
        result[1] = this.forwardX(range[1]);
        result[2] = this.forwardY(range[2]);
        result[3] = this.forwardY(range[3]);

        return result;
    }

    public forwardTransformPoint
    (
        range: IReadonlyVec2<TArray>,
        result: Vec2<TArray> = range.slice(),
    )
        : Vec2<TArray>
    {
        result[0] = this.forwardX(range[0]);
        result[1] = this.forwardY(range[1]);

        return result;
    }

    public reverseTransformRange
    (
        range: IReadonlyRange2d<TArray>,
        result: Range2d<TArray> = range.slice(),
    )
        : Range2d<TArray>
    {
        result[0] = this.reverseX(range[0]);
        result[1] = this.reverseX(range[1]);
        result[2] = this.reverseY(range[2]);
        result[3] = this.reverseY(range[3]);

        return result;
    }

    public reverseTransformPoint
    (
        range: IReadonlyVec2<TArray>,
        result: Vec2<TArray> = range.slice(),
    )
        : Vec2<TArray>
    {
        result[0] = this.reverseX(range[0]);
        result[1] = this.reverseY(range[1]);

        return result;
    }
}