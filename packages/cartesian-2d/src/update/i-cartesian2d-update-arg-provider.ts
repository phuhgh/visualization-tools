import { TTypedArray } from "rc-js-util";
import { ICartesian2dPlotRange } from "./cartesian2d-plot-range";
import { ICartesian2dUpdateArg } from "./cartesian2d-update-arg";
import { IEntityUpdateArgProvider } from "@visualization-tools/core";

/**
 * @public
 * Created every frame and on interaction events, passed to graphics and interaction components.
 */
export interface ICartesian2dUpdateArgProvider<TArray extends TTypedArray, TRequiredTraits>
    extends IEntityUpdateArgProvider<ICartesian2dPlotRange<TArray>, ICartesian2dUpdateArg<TArray>, TRequiredTraits>
{
}