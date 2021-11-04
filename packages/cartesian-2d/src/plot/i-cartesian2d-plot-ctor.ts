import { TTypedArray } from "rc-js-util";
import { ICartesian2dPlot } from "./i-cartesian2d-plot";
import { ICartesian2dPlotCtorArg } from "./cartesian2d-plot-ctor-arg";
import { TUnknownComponentRenderer } from "@visualization-tools/core";

/**
 * @public
 */
export interface ICartesian2dPlotCtor<TComponentRenderer extends TUnknownComponentRenderer
    , TArray extends TTypedArray
    , TRequiredTraits>
{
    readonly prototype: ICartesian2dPlot<TComponentRenderer, TArray, TRequiredTraits>;
    new
    (
        arg: ICartesian2dPlotCtorArg<TArray, TRequiredTraits>,
    )
        : ICartesian2dPlot<TComponentRenderer, TArray, TRequiredTraits>;
}

