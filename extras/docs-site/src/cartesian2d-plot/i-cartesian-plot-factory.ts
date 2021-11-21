import { TTypedArray } from "rc-js-util";
import { ICartesian2dPlot, ICartesian2dPlotConstructionOptions } from "@visualization-tools/cartesian-2d";
import { IChartComponent, TUnknownRenderer } from "@visualization-tools/core";

export interface ICartesianPlotFactory<TRenderer extends TUnknownRenderer
    , TArray extends TTypedArray
    , TRequiredTraits>
{
    createOne
    (
        chart: IChartComponent<TRenderer>,
        options: ICartesian2dPlotConstructionOptions<TArray, TRequiredTraits>,
    )
        : ICartesian2dPlot<TRenderer["TComponentRenderer"], TArray, TRequiredTraits>;
}