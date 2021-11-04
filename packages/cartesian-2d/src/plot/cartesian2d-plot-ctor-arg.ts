import { IChartComponent, IPlotArea, IPlotCtorArg, TUnknownRenderer } from "@visualization-tools/core";
import { TTypedArray } from "rc-js-util";
import { ICartesian2dPlotRange } from "../update/update-arg/cartesian2d-plot-range";
import { ICartesian2dPlotConstructionOptions } from "./options/cartesian2d-plot-construction-options";
import { T2dUpdateGroup } from "./options/t2d-update-group";

/**
 * @public
 * The construction arg of {@link ICartesian2dPlot}.
 */
export interface ICartesian2dPlotCtorArg<TArray extends TTypedArray, TRequiredTraits>
    extends IPlotCtorArg<ICartesian2dPlotRange<TArray>, T2dUpdateGroup<TArray, TRequiredTraits>, TRequiredTraits>
{
    plotOptions: ICartesian2dPlotConstructionOptions<TArray, TRequiredTraits>;
}

/**
 * @public
 * {@inheritDoc ICartesian2dPlotCtorArg}
 */
export class Cartesian2dPlotCtorArg<TArray extends TTypedArray, TRequiredTraits>
    implements ICartesian2dPlotCtorArg<TArray, TRequiredTraits>
{
    public constructor
    (
        public readonly chart: IChartComponent<TUnknownRenderer>,
        public readonly plotOptions: ICartesian2dPlotConstructionOptions<TArray, TRequiredTraits>,
        public readonly plotArea: IPlotArea,
    )
    {
    }
}
