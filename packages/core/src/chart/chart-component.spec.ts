import { OnPlotAttachChanged } from "../plot/events/on-plot-attach-changed";
import { IChartComponent } from "./chart-component";
import { _Production, _Promise, IncrementingIdentifierFactory, Range2d } from "rc-js-util";
import { debugDescribe } from "rc-js-test-util";
import { TestGlChartHarness } from "../test-utils/test-gl-chart-harness";
import { TestGlPlotFactory } from "../test-utils/fakes/test-gl-plot-factory";
import { TUnknownRenderer } from "../rendering/t-unknown-renderer";
import { OnRendererContextLost } from "../rendering/events/on-renderer-context-lost";
import { OnRendererContextRestored } from "../rendering/events/on-renderer-context-restored";
import { ChartEntity } from "../entities/chart-entity";
import { BufferLayout } from "../rendering/buffers/buffer-layout";

debugDescribe("=> ChartComponent", () =>
{
    let harness: TestGlChartHarness;

    beforeEach(() =>
    {
        harness = new TestGlChartHarness();
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
            let emittedChart: IChartComponent<TUnknownRenderer> | undefined;
            const plot = TestGlPlotFactory.createOne(harness.chart);
            OnPlotAttachChanged.registerListener(plot, (isAttached, chart) => isAttached && (emittedChart = chart));
            harness.chart.addPlot(plot);
            expect(emittedChart).toBe(harness.chart);
        });

        it("| sizes the plot to fit in the configured space", () =>
        {
            const plot = TestGlPlotFactory.createOne(harness.chart);
            harness.chart.addPlot(plot);
            expect(plot.plotDimensionsOBL.cssArea.wholeRange).toEqual(Range2d.f32.factory.createOne(0, 150, 0, 150));
        });

        it("| emits nothing if already added", () =>
        {
            let emittedChart: IChartComponent<TUnknownRenderer> | undefined;
            const plot = TestGlPlotFactory.createOne(harness.chart);
            harness.chart.addPlot(plot);
            OnPlotAttachChanged.registerListener(plot, (isAttached, chart) => isAttached && (emittedChart = chart));
            harness.chart.addPlot(plot);
            expect(emittedChart).toBe(undefined);
        });
    });

    describe("=> removePlot", () =>
    {
        it("| emits a detach event", () =>
        {
            let emittedChart: IChartComponent<TUnknownRenderer> | undefined;
            const plot = TestGlPlotFactory.createOne(harness.chart);
            harness.chart.addPlot(plot);
            OnPlotAttachChanged.registerListener(plot, (isAttached, chart) => !isAttached && (emittedChart = chart));
            harness.chart.removePlot(plot);
            expect(emittedChart).toBe(harness.chart);
        });

        it("| emits nothing if already detached", () =>
        {
            let emittedChart: IChartComponent<TUnknownRenderer> | undefined;
            const plot = TestGlPlotFactory.createOne(harness.chart);
            harness.chart.addPlot(plot);
            harness.chart.removePlot(plot);
            OnPlotAttachChanged.registerListener(plot, (isAttached, chart) => !isAttached && (emittedChart = chart));
            harness.chart.removePlot(plot);
            expect(emittedChart).toBe(harness.chart);
        });
    });

    describe("=> context loss", () =>
    {
        it("| emits a loss event if attached", () =>
        {
            const plot = TestGlPlotFactory.createOne(harness.chart);
            harness.chart.addPlot(plot);

            const p = Promise
                .all([
                    new Promise((done) =>
                    {
                        OnRendererContextLost.registerListener(harness.chart.eventService, () => done(undefined));
                    }),
                    new Promise((done) =>
                    {
                        OnRendererContextLost.registerListener(plot.eventService, () => done(undefined));
                    }),
                ]);

            getLoseContextExtensions(harness).loseContext();

            return p;
        });

        it("| emits nothing if already detached", async () =>
        {
            let eventEmitted = false;
            const plot = TestGlPlotFactory.createOne(harness.chart);

            const p = new Promise((done) => OnRendererContextLost.registerListener(harness.chart.eventService, () => done(undefined)));
            OnRendererContextLost.registerListener(plot.eventService, () => eventEmitted = true);
            harness.chart.removePlot(plot);

            getLoseContextExtensions(harness).loseContext();

            await p;
            // allow for arbitrary call ordering
            await _Promise.delay(undefined);
            expect(eventEmitted).toBe(false);
        });
    });

    describe("=> context restored", () =>
    {
        it("| emits a restored event if attached", async () =>
        {
            const plot = TestGlPlotFactory.createOne(harness.chart);
            harness.chart.addPlot(plot);

            const p = Promise
                .all([
                    new Promise((done) =>
                    {
                        OnRendererContextRestored.registerListener(harness.chart.eventService, () => done(undefined));
                    }),
                    new Promise((done) =>
                    {
                        OnRendererContextRestored.registerListener(plot.eventService, () => done(undefined));
                    }),
                ]);

            const loseContextExtension = getLoseContextExtensions(harness);

            loseContextExtension.loseContext();
            await _Promise.delay(undefined);
            loseContextExtension.restoreContext();

            return p;
        });

        it("| emits nothing if already detached", async () =>
        {
            let eventEmitted = false;
            const plot = TestGlPlotFactory.createOne(harness.chart);

            const p = new Promise((done) => OnRendererContextRestored.registerListener(harness.chart.eventService, () => done(undefined)));
            OnRendererContextRestored.registerListener(plot.eventService, () => eventEmitted = true);
            harness.chart.removePlot(plot);

            const loseContextExtension = getLoseContextExtensions(harness);

            loseContextExtension.loseContext();
            await _Promise.delay(undefined);
            loseContextExtension.restoreContext();

            await p;
            // allow for arbitrary call ordering
            await _Promise.delay(undefined);
            expect(eventEmitted).toBe(false);
        });
    });

    describe("=> entity buffers", () =>
    {
        it("| deletes buffers when an entity is removed from all plots", () =>
        {
            const getLayoutsSpy = spyOn(harness.chart.renderer.sharedState.entityBuffers, "getLayouts").and.callThrough();
            const clearLayoutsSpy = spyOn(harness.chart.renderer.sharedState.entityBuffers, "clearLayouts").and.callThrough();

            const p1 = TestGlPlotFactory.createOne(harness.chart);
            const p2 = TestGlPlotFactory.createOne(harness.chart);
            harness.chart.addPlot(p1);
            harness.chart.addPlot(p2);
            const entity = new ChartEntity(new IncrementingIdentifierFactory());
            p1.addEntity(entity);
            p2.addEntity(entity);
            harness.chart.renderer.sharedState.entityBuffers.setNewLayout(
                entity,
                0,
                new BufferLayout([]),
            );
            p1.removeEntity(entity);

            expect(getLayoutsSpy).not.toHaveBeenCalled();
            expect(clearLayoutsSpy).not.toHaveBeenCalled();

            p2.removeEntity(entity);

            expect(getLayoutsSpy).toHaveBeenCalled();
            expect(clearLayoutsSpy).toHaveBeenCalled();
        });
    });
});

function getLoseContextExtensions(harness: TestGlChartHarness<never>): WEBGL_lose_context
{
    const ext = harness.chart.renderer.context.getExtension("WEBGL_lose_context");

    if (ext == null)
    {
        throw _Production.createError("failed to load extension required for test");
    }

    return ext;
}