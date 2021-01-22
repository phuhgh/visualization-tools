import { ICanvasEntityRenderer } from "../../rendering/canvas/canvas-entity-renderer";
import { TF64Range2d } from "rc-js-util/bin/src/array/typed-array/2d/range2d/range2d";
import { getTestCanvasOptions } from "./get-test-canvas-options";
import { Range2d } from "rc-js-util";
import { IEntityGroup } from "../../entities/groups/a-entity-group";
import { IPlot } from "../../plot/i-plot";
import { IPlotConstructionOptions } from "../../plot/i-plot-construction-options";
import { PlotArea } from "../../plot/i-plot-area";
import { Plot } from "../../plot/plot";
import { PlotCtorArg } from "../../plot/plot-ctor-arg";
import { IChartComponent } from "../../chart/chart-component";

/**
 * @internal
 */
export class CanvasTestPlotFactory
{
    public static createOne<TEntityRenderer extends ICanvasEntityRenderer>
    (
        chart: IChartComponent<TEntityRenderer>,
        plotOptions: IPlotConstructionOptions<TF64Range2d, IEntityGroup<unknown, unknown>, unknown> = getTestCanvasOptions(),
    )
        : IPlot<TF64Range2d, unknown>
    {
        const halfCs = Range2d.f32.factory.createOne(-1, 0, -1, 0);
        return new Plot(new PlotCtorArg(chart, plotOptions, new PlotArea(halfCs, halfCs.slice())));
    }
}
