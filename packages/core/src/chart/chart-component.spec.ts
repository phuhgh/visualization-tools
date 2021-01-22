import { TestCanvasChartHarness } from "../test-utils/test-canvas-chart-harness";
import { OnPlotAttached } from "../plot/events/on-plot-attached";
import { IChartComponent } from "./chart-component";
import { TUnknownEntityRenderer } from "../rendering/t-unknown-entity-renderer";
import { OnPlotDetached } from "../plot/events/on-plot-detached";
import { Range2d } from "rc-js-util";
import { debugDescribe } from "rc-js-test-util";
import { CanvasTestPlotFactory } from "../test-utils/fakes/canvas-test-plot-factory";

debugDescribe("=> ChartComponent", () =>
{
    let harness: TestCanvasChartHarness;

    beforeEach(() =>
    {
        harness = new TestCanvasChartHarness();
        harness.attachToBody();
    });

    afterEach(() =>
    {
        harness.removeFromBody();
    });

    describe("=> addPlot", () =>
    {
        it("| emits a attach event if not already added", () =>
        {
            let emittedChart: IChartComponent<TUnknownEntityRenderer> | undefined;
            const plot = CanvasTestPlotFactory.createOne(harness.chart);
            OnPlotAttached.registerListener(plot, chart => emittedChart = chart);
            harness.chart.addPlot(plot);
            expect(emittedChart).toBe(harness.chart);
        });

        it("| sizes the plot to fit in the configured space", () =>
        {
            const plot = CanvasTestPlotFactory.createOne(harness.chart);
            harness.chart.addPlot(plot);
            expect(plot.plotDimensionsOBL.cssArea.wholeRange).toEqual(Range2d.f32.factory.createOne(0, 150, 0, 150));
        });

        it("| emits nothing if already added", () =>
        {
            let emittedChart: IChartComponent<TUnknownEntityRenderer> | undefined;
            const plot = CanvasTestPlotFactory.createOne(harness.chart);
            harness.chart.addPlot(plot);
            OnPlotAttached.registerListener(plot, chart => emittedChart = chart);
            harness.chart.addPlot(plot);
            expect(emittedChart).toBe(undefined);
        });
    });

    describe("=> removePlot", () =>
    {
        it("| emits a detach event", () =>
        {
            let emittedChart: IChartComponent<TUnknownEntityRenderer> | undefined;
            const plot = CanvasTestPlotFactory.createOne(harness.chart);
            harness.chart.addPlot(plot);
            OnPlotDetached.registerListener(plot, chart => emittedChart = chart);
            harness.chart.removePlot(plot);
            expect(emittedChart).toBe(harness.chart);
        });

        it("| emits nothing if already detached", () =>
        {
            let emittedChart: IChartComponent<TUnknownEntityRenderer> | undefined;
            const plot = CanvasTestPlotFactory.createOne(harness.chart);
            harness.chart.addPlot(plot);
            harness.chart.removePlot(plot);
            OnPlotDetached.registerListener(plot, chart => emittedChart = chart);
            harness.chart.removePlot(plot);
            expect(emittedChart).toBe(harness.chart);
        });
    });

    // FIXME add specs for context loss
});