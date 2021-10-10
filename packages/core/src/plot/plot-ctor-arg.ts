import { IChartComponent } from "../chart/chart-component";
import { IPlotArea } from "./i-plot-area";
import { IEntityGroup } from "../entities/groups/a-entity-group";
import { IPlotConstructionOptions } from "./i-plot-construction-options";
import { TUnknownRenderer } from "../rendering/t-unknown-renderer";

/**
 * @public
 * Default plot construction args.
 */
export interface IPlotCtorArg<TPlotRange
    , TUpdateGroup extends IEntityGroup<unknown, TRequiredTraits>
    , TRequiredTraits>
{
    readonly chart: IChartComponent<TUnknownRenderer>;
    readonly plotOptions: IPlotConstructionOptions<TPlotRange, TUpdateGroup, TRequiredTraits>;
    readonly plotArea: IPlotArea;
}

/**
 * @public
 * {@inheritDoc IPlotCtorArg}
 */
export class PlotCtorArg<TPlotRange
    , TUpdateGroup extends IEntityGroup<unknown, TRequiredTraits>
    , TRequiredTraits>
    implements IPlotCtorArg<TPlotRange, TUpdateGroup, TRequiredTraits>
{
    public constructor
    (
        public readonly chart: IChartComponent<TUnknownRenderer>,
        public readonly plotOptions: IPlotConstructionOptions<TPlotRange, TUpdateGroup, TRequiredTraits>,
        public readonly plotArea: IPlotArea,
    )
    {
    }
}
