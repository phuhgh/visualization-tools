import { IReadonlyRange2d, IReadonlyVec2, Range2d, TTypedArray, Vec2 } from "rc-js-util";
import { ECartesian2dUserTransform } from "./e-cartesian2d-user-transform";
import { IUserTransform } from "@visualization-tools/core";

/**
 * @public
 * A user transform to apply before the screen space transform. By default this is identity.
 */
export interface ICartesian2dUserTransform<TArray extends TTypedArray> extends IUserTransform
{
    readonly transformId: ECartesian2dUserTransform;
    readonly xTransformEnabled: boolean;
    readonly yTransformEnabled: boolean;

    updateTransform(xTransformEnabled: boolean, yTransformEnabled: boolean): void;

    forwardX(x: number): number;
    forwardY(y: number): number;

    reverseX(x: number): number;
    reverseY(y: number): number;

    forwardTransformRange
    (
        range: IReadonlyRange2d<TArray>,
        result?: Range2d<TArray>,
    )
        : Range2d<TArray>;

    forwardTransformPoint
    (
        point: IReadonlyVec2<TArray>,
        result?: Vec2<TArray>,
    )
        : Vec2<TArray>;

    reverseTransformRange
    (
        range: IReadonlyRange2d<TArray>,
        result?: Range2d<TArray>,
    )
        : Range2d<TArray>;

    reverseTransformPoint
    (
        point: IReadonlyVec2<TArray>,
        result?: Vec2<TArray>,
    )
        : Vec2<TArray>;
}

