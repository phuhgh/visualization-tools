import { IReadonlyRange2d, Range2d, TTypedArray } from "rc-js-util";

/**
 * @public
 * Constrains a 2d draw range.
 */
export interface ICartesian2dInteractionBounder<TArray extends TTypedArray>
{
    maxBounds: IReadonlyRange2d<TArray>;
    maxZoom: number;
    boundRange
    (
        o_dataRange: Range2d<TArray>,
        pixelRange: IReadonlyRange2d<Float32Array>,
        maxBounds: IReadonlyRange2d<TArray>,
    )
        : void;
}