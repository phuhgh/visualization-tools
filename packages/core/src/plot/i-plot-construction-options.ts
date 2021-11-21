import { IEntityGroup } from "../entities/groups/a-entity-group";
import { TF32Range2d } from "rc-js-util";
import { IReadonlyPlot } from "./i-plot";
import { IPlotUpdateStrategy } from "../update/i-plot-update-strategy";
import { IPlotRange } from "./i-plot-range";

/**
 * @public
 */
export interface IPlotConstructionOptions<TPlotRange extends IPlotRange
    , TUpdateGroup extends IEntityGroup<unknown, TRequiredTraits>
    , TRequiredTraits>
{
    /**
     * Debug identifier.
     */
    readonly plotName?: string;
    readonly updateGroup: TUpdateGroup;
    readonly plotRange: TPlotRange;
    /**
     * Position of the plot on the canvas in clip space.
     */
    readonly plotPosition: TF32Range2d;

    createUpdateStrategy
    (
        plot: IReadonlyPlot<TPlotRange, TRequiredTraits>,
        updateGroup: TUpdateGroup,
    )
        : IPlotUpdateStrategy<TUpdateGroup>;
}