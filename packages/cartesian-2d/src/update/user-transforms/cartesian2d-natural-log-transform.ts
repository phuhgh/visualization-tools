import { ICartesian2dUserTransform } from "./i-cartesian2d-user-transform";
import { _Debug, _Fp, TTypedArray } from "rc-js-util";
import { ACartesian2dUserTransform } from "./a-cartesian2d-user-transform";
import { ECartesian2dUserTransform } from "./e-cartesian2d-user-transform";

/**
 * @public
 * Apply natural log as a transform, range must be greater than 0.
 */
export class Cartesian2dNaturalLogTransform<TArray extends TTypedArray>
    extends ACartesian2dUserTransform<TArray>
    implements ICartesian2dUserTransform<TArray>
{
    public static transformId = Symbol("natural log");
    public readonly transformId: ECartesian2dUserTransform = ECartesian2dUserTransform.NaturalLog;
    public readonly userTransformId = Cartesian2dNaturalLogTransform.transformId;

    public constructor
    (
        public xTransformEnabled: boolean,
        public yTransformEnabled: boolean,
    )
    {
        super();

        if (xTransformEnabled)
        {
            this.forwardX = this.forwardTransform;
            this.reverseX = this.reverseTransform;
        }
        else
        {
            this.forwardX = _Fp.identity;
            this.reverseX = _Fp.identity;
        }

        if (yTransformEnabled)
        {
            this.forwardY = this.forwardTransform;
            this.reverseY = this.reverseTransform;
        }
        else
        {
            this.forwardY = _Fp.identity;
            this.reverseY = _Fp.identity;
        }
    }

    public forwardX: (x: number) => number;
    public forwardY: (y: number) => number;

    public reverseX: (x: number) => number;
    public reverseY: (y: number) => number;

    private forwardTransform(value: number): number
    {
        DEBUG_MODE && _Debug.assert(value > 0, "range must be greater than 0");
        return Math.log(value);
    }

    private reverseTransform(value: number): number
    {
        return Math.pow(Math.E, value);
    }
}
