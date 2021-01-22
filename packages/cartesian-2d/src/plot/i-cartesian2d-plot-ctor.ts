import { TTypedArray } from "rc-js-util";
import { ICartesian2dPlot } from "./i-cartesian2d-plot";
import { ICartesian2dPlotCtorArg } from "./cartesian2d-plot-ctor-arg";
import { TUnknownEntityRenderer } from "@visualization-tools/core";

/**
 * @public
 */
export interface ICartesian2dPlotCtor<TEntityRenderer extends TUnknownEntityRenderer
    , TArray extends TTypedArray
    , TRequiredTraits>
{
    readonly prototype: ICartesian2dPlot<TEntityRenderer, TArray, TRequiredTraits>;
    new
    (
        arg: ICartesian2dPlotCtorArg<TArray, TRequiredTraits>,
    )
        : ICartesian2dPlot<TEntityRenderer, TArray, TRequiredTraits>;
}

