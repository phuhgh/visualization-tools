import { TTypedArray } from "rc-js-util";
import { IUpdate2dGroup } from "../../update/update-2d-group";
import { ICartesian2dPlotRange } from "../../update/cartesian2d-plot-range";
import { ICartesian2dUpdateArg } from "../../update/cartesian2d-update-arg";

/**
 * @public
 */
export type T2dUpdateGroup<TArray extends TTypedArray, TRequiredTraits> =
    IUpdate2dGroup<ICartesian2dPlotRange<TArray>, ICartesian2dUpdateArg<TArray>, TRequiredTraits>
    ;
