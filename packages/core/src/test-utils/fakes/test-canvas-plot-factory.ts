import { getTestCanvasOptions } from "./get-test-canvas-options";
import { Range2d } from "rc-js-util";
import { IEntityGroup } from "../../entities/groups/a-entity-group";
import { IPlot } from "../../plot/i-plot";
import { IPlotConstructionOptions } from "../../plot/i-plot-construction-options";
import { PlotArea } from "../../plot/i-plot-area";
import { Plot } from "../../plot/plot";
import { PlotCtorArg } from "../../plot/plot-ctor-arg";
import { IChartComponent } from "../../chart/chart-component";
import { ICanvasRenderer } from "../../rendering/canvas/canvas-renderer";
import { IPlotRange } from "../../plot/i-plot-range";
import { ITestPlotRange } from "./i-test-plot-range";

/**
 * @internal
 */
export class TestCanvasPlotFactory
{
    public static createOne
    (
        chart: IChartComponent<ICanvasRenderer>,
        plotOptions: IPlotConstructionOptions<ITestPlotRange<Float64Array>, IEntityGroup<unknown, unknown>, unknown> = getTestCanvasOptions(),
    )
        : IPlot<IPlotRange, unknown>
    {
        const halfCs = Range2d.f32.factory.createOne(-1, 0, -1, 0);
        return new Plot(new PlotCtorArg(chart, plotOptions, new PlotArea(halfCs, halfCs.slice())));
    }
}
