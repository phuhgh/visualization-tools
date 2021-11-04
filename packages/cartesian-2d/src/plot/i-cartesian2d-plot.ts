import { TTypedArray } from "rc-js-util";
import { IEntityCategory, IPlot, TUnknownComponentRenderer } from "@visualization-tools/core";
import { ICartesian2dPlotRange } from "../update/update-arg/cartesian2d-plot-range";
import { ICartesian2dUpdateArgProvider } from "../update/update-arg/i-cartesian2d-update-arg-provider";
import { ICartesian2dUpdateArg } from "../update/update-arg/cartesian2d-update-arg";

/**
 * @public
 */
export interface ICartesian2dPlot<TComponentRenderer extends TUnknownComponentRenderer
    , TArray extends TTypedArray
    , TRequiredTraits>
    extends IPlot<ICartesian2dPlotRange<TArray>, TRequiredTraits>
{
    updateArgProvider: ICartesian2dUpdateArgProvider<TArray, TRequiredTraits>;
    metaCategory: IEntityCategory<TComponentRenderer, ICartesian2dUpdateArg<TArray>, TRequiredTraits>;
    dataCategory: IEntityCategory<TComponentRenderer, ICartesian2dUpdateArg<TArray>, TRequiredTraits>;
}

