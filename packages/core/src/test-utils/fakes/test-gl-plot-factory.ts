import { Range2d, TF32Range2d } from "rc-js-util";
import { IEntityGroup } from "../../entities/groups/a-entity-group";
import { IPlot } from "../../plot/i-plot";
import { IPlotConstructionOptions } from "../../plot/i-plot-construction-options";
import { PlotArea } from "../../plot/i-plot-area";
import { Plot } from "../../plot/plot";
import { PlotCtorArg } from "../../plot/plot-ctor-arg";
import { IChartComponent } from "../../chart/chart-component";
import { IGlRenderer } from "../../rendering/gl/gl-renderer";
import { TGl2ComponentRenderer } from "../../rendering/gl/component-renderer/t-gl2-component-renderer";
import { getTestGlOptions } from "./get-test-gl-options";

/**
 * @internal
 */
export class TestGlPlotFactory
{
    public static createOne
    (
        chart: IChartComponent<IGlRenderer<TGl2ComponentRenderer>>,
        plotOptions: IPlotConstructionOptions<TF32Range2d, IEntityGroup<unknown, unknown>, unknown> = getTestGlOptions(),
    )
        : IPlot<TF32Range2d, unknown>
    {
        const halfCs = Range2d.f32.factory.createOne(-1, 0, -1, 0);
        return new Plot(new PlotCtorArg(chart, plotOptions, new PlotArea(halfCs, halfCs.slice())));
    }
}
