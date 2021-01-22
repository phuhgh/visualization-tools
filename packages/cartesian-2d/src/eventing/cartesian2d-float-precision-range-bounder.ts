import { _Debug, _F32, _F64, IReadonlyRange2d, Range2d, Vec2 } from "rc-js-util";
import { ICartesian2dInteractionBounder } from "./i-cartesian2d-interaction-bounder";

/**
 * @public
 * Constrains the data range so that the mapping into screen space is not worse than per pixel because of float precision.
 *
 * @remarks
 * The maximum zoom is a function of magnitude, larger values will have fewer bytes of precision. High dpi screens will
 * typically have a range between 2 and 4 times smaller than standard definition screens.
 */
export class Cartesian2dFloatPrecisionRangeBounder<TArray extends Float32Array | Float64Array>
    implements ICartesian2dInteractionBounder<TArray>
{
    public maxBounds: IReadonlyRange2d<TArray>;
    public maxZoom: number;

    public constructor
    (
        private readonly numberUtil: TArray extends Float32Array ? typeof _F32 : typeof _F64,
        rangeScaleFactor: number,
    )
    {
        DEBUG_MODE && _Debug.assert(rangeScaleFactor <= 1, "the range is already a maximum");
        this.maxBounds = this.numberUtil.bounds.scaleRelativeTo(rangeScaleFactor, Vec2.u8.factory.createOne(0, 0)) as Range2d<TArray>;
        this.maxZoom = Math.pow(2, this.numberUtil.mantissaBits);
    }

    public boundRange
    (
        o_dataRange: Range2d<TArray>,
        pixelRange: IReadonlyRange2d<Float32Array>,
        maxBounds: IReadonlyRange2d<TArray> = this.maxBounds,
    )
        : void
    {
        const xMinRange = this.numberUtil.getPrecision(o_dataRange.getXMaxAbs()) * pixelRange.getXRange();
        const yMinRange = this.numberUtil.getPrecision(o_dataRange.getYMaxAbs()) * pixelRange.getYRange();

        o_dataRange.ensureMinRange(xMinRange, yMinRange);
        o_dataRange.bound(maxBounds);
    }
}