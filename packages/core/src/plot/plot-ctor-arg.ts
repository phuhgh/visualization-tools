import { IChartComponent } from "../chart/chart-component";
import { IPlotArea } from "./i-plot-area";
import { IEntityGroup } from "../entities/groups/a-entity-group";
import { TUnknownEntityRenderer } from "../rendering/t-unknown-entity-renderer";
import { IPlotConstructionOptions } from "./i-plot-construction-options";

/**
 * @public
 * Default plot construction args.
 */
export interface IPlotCtorArg<TPlotRange
    , TUpdateGroup extends IEntityGroup<unknown, TRequiredTraits>
    , TRequiredTraits>
{
    readonly chart: IChartComponent<TUnknownEntityRenderer>;
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
        public readonly chart: IChartComponent<TUnknownEntityRenderer>,
        public readonly plotOptions: IPlotConstructionOptions<TPlotRange, TUpdateGroup, TRequiredTraits>,
        public readonly plotArea: IPlotArea,
    )
    {
    }
}
