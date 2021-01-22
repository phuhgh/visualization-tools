import { TTypedArray } from "rc-js-util";
import { IEntityCategory, IPlot, TUnknownEntityRenderer } from "@visualization-tools/core";
import { ICartesian2dPlotRange } from "../update/cartesian2d-plot-range";
import { ICartesian2dUpdateArgProvider } from "../update/i-cartesian2d-update-arg-provider";
import { ICartesian2dUpdateArg } from "../update/cartesian2d-update-arg";

/**
 * @public
 */
export interface ICartesian2dPlot<TEntityRenderer extends TUnknownEntityRenderer
    , TArray extends TTypedArray
    , TRequiredTraits>
    extends IPlot<ICartesian2dPlotRange<TArray>, TRequiredTraits>
{
    updateArgProvider: ICartesian2dUpdateArgProvider<TArray, TRequiredTraits>;
    metaCategory: IEntityCategory<TEntityRenderer, ICartesian2dUpdateArg<TArray>, TRequiredTraits>;
    dataCategory: IEntityCategory<TEntityRenderer, ICartesian2dUpdateArg<TArray>, TRequiredTraits>;
}

