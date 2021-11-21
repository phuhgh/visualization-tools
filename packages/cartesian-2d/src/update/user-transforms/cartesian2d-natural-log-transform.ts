import { ICartesian2dUserTransform } from "./i-cartesian2d-user-transform";
import { _Debug, _Fp } from "rc-js-util";
import { ACartesian2dUserTransform } from "./a-cartesian2d-user-transform";
import { ECartesian2dUserTransform } from "./e-cartesian2d-user-transform";

/**
 * @public
 * Apply natural log as a transform, range must be greater than 0.
 */
export class Cartesian2dNaturalLogTransform
    extends ACartesian2dUserTransform
    implements ICartesian2dUserTransform
{
    public static transformId = Symbol("natural log");
    public readonly transformId: ECartesian2dUserTransform = ECartesian2dUserTransform.NaturalLog;
    public readonly userTransformId = Cartesian2dNaturalLogTransform.transformId;

    public forwardX: (x: number) => number = _Fp.identity;
    public forwardY: (y: number) => number = _Fp.identity;
    public reverseX: (x: number) => number = _Fp.identity;
    public reverseY: (y: number) => number = _Fp.identity;

    public constructor
    (
        public xTransformEnabled: boolean,
        public yTransformEnabled: boolean,
    )
    {
        super();
        this.updateTransform(xTransformEnabled, yTransformEnabled);
    }

    public override updateTransform(xTransformEnabled: boolean, yTransformEnabled: boolean): void
    {
        super.updateTransform(xTransformEnabled, yTransformEnabled);
        Object.assign(this, Cartesian2dNaturalLogTransform.getTransforms(xTransformEnabled, yTransformEnabled));
    }

    private static forwardTransform(value: number): number
    {
        DEBUG_MODE && _Debug.assert(value > 0, "range must be greater than 0");
        return Math.log(value);
    }

    private static reverseTransform(value: number): number
    {
        return Math.pow(Math.E, value);
    }

    private static getTransforms(xTransformEnabled: boolean, yTransformEnabled: boolean)
    {
        let forwardX: (x: number) => number;
        let forwardY: (x: number) => number;
        let reverseX: (x: number) => number;
        let reverseY: (x: number) => number;

        if (xTransformEnabled)
        {
            forwardX = Cartesian2dNaturalLogTransform.forwardTransform;
            reverseX = Cartesian2dNaturalLogTransform.reverseTransform;
        }
        else
        {
            forwardX = _Fp.identity;
            reverseX = _Fp.identity;
        }

        if (yTransformEnabled)
        {
            forwardY = Cartesian2dNaturalLogTransform.forwardTransform;
            reverseY = Cartesian2dNaturalLogTransform.reverseTransform;
        }
        else
        {
            forwardY = _Fp.identity;
            reverseY = _Fp.identity;
        }

        return {
            forwardX: forwardX,
            forwardY: forwardY,
            reverseX: reverseX,
            reverseY: reverseY,
        };
    }
}
