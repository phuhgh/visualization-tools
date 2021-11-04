import { ICartesian2dUserTransform } from "./i-cartesian2d-user-transform";
import { TTypedArray } from "rc-js-util";
import { ACartesian2dUserTransform } from "./a-cartesian2d-user-transform";
import { ECartesian2dUserTransform } from "./e-cartesian2d-user-transform";

/**
 * @public
 * Apply no transform.
 */
export class Cartesian2dIdentityTransform<TArray extends TTypedArray>
    extends ACartesian2dUserTransform<TArray>
    implements ICartesian2dUserTransform<TArray>
{
    public static transformId = Symbol("identity");
    public readonly transformId: ECartesian2dUserTransform = ECartesian2dUserTransform.Identity;
    public readonly xTransformEnabled: boolean = true;
    public readonly yTransformEnabled: boolean = true;
    public readonly userTransformId = Cartesian2dIdentityTransform.transformId;

    public forwardX(x: number): number
    {
        return x;
    }

    public forwardY(y: number): number
    {
        return y;
    }

    public reverseX(x: number): number
    {
        return x;
    }

    public reverseY(y: number): number
    {
        return y;
    }
}
