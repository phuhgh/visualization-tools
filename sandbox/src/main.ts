import { CanvasChartFactory, ChartConfig, ChartDataEntity, EEntityUpdateFlag, Gl2ContextAdapter, GlChartFactory, GlRendererOptions, HitAlwaysAllowedComponent, SharedInterleavedConnector } from "@visualization-tools/core";
import { getTestPlotOptions } from "./test-data/get-test-plot-options";
import { _Debug, _Fp, Emscripten, getEmscriptenWrapper, IEmscriptenWrapper, Mulberry32Generator, Range1d, Range2d, RgbaColorPacker } from "rc-js-util";
import { populateTestData } from "./test-data/populate-test-data";
import { CanvasCartesian2dPlotFactory, CanvasCartesian2dUpdateArgProvider, CanvasLineGraphicsComponent, Cartesian2dPlotRange, Cartesian2dPlotSharedQuadTree, GlCaplessLineGraphicsComponent, GlCartesian2dCameraBinder, GlCartesian2dPlotFactory, GlCartesian2dUpdateArgProvider, GlInterleaved2dPointBinder, GlLineFlatCapGraphicsComponent, hoverHighlightLineSegment, ICartesian2dBindings, Point2dDisplaySettings, Point2dSubcategory, SharedInterleavedLine2dQuadIndexerFactory, SharedInterleavedPoint2dHitTestComponent, TPoint2dSettings } from "@visualization-tools/cartesian-2d";

declare const require: (path: string) => Emscripten.EmscriptenModuleFactory<ICartesian2dBindings>;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const testModule = require("sandbox-module");

// todo jack
// setDefaultAppTestFlags();
_Debug.setFlag("DEBUG_MODE", true);
_Debug.setFlag("DEBUG_VERBOSE", true);
const rnd = new Mulberry32Generator(79769);

window.onload = async () =>
{
    const emscriptenModule = await getEmscriptenWrapper(new WebAssembly.Memory({ initial: 256, maximum: 8192 }), testModule);
    canvasTestChartGo(emscriptenModule);
    glTestChartGo(emscriptenModule);
};

export function canvasTestChartGo(emscriptenModule: IEmscriptenWrapper<ICartesian2dBindings>): void
{
    const dataRange = Range2d.f64.factory.createOne(-2, 2, -2, 2);
    const someData = SharedInterleavedConnector.createOneF32(emscriptenModule, 40, { offsets: { x: 0, y: 1, size: 2, color: 3 }, blockElementCount: 4 });
    populateTestData(someData, dataRange, 255, rnd);

    const chart = CanvasChartFactory.createOne(document.getElementById("canvas-chart") as HTMLElement, new ChartConfig());
    const pointSubcategory = new Point2dSubcategory(Range1d.f64.factory.createOne(10, 20));
    const graphicsSettings: TPoint2dSettings<Float64Array> = {
        pointDisplay: new Point2dDisplaySettings(1, RgbaColorPacker.packColor(255, 0, 0, 255)),
        pointSizeNormalizer: pointSubcategory.normalization,
        zIndexAbs: 0,
        zIndexRel: 0,
    };

    if (chart == null)
    {
        throw new Error("failed to create renderer");
    }

    const canvasLineGraphicsComponent = new CanvasLineGraphicsComponent();

    const plot1 = chart.addPlot(CanvasCartesian2dPlotFactory.createOne(
        chart,
        getTestPlotOptions(
            new CanvasCartesian2dUpdateArgProvider(),
            Range2d.f32.factory.createOne(-1, 0, -1, 0),
            "plot lower left",
            Cartesian2dPlotRange.createOneF64(
                Range2d.f64.factory.createOne(-4, 4, -4, 4),
                dataRange.slice(),
                4,
                chart.attachPoint.canvasDims,
            ),
        ),
    ));

    plot1.dataCategory.addEntity(new ChartDataEntity(someData, graphicsSettings, chart.changeIdFactory), canvasLineGraphicsComponent, pointSubcategory);

    const plot2 = chart.addPlot(CanvasCartesian2dPlotFactory.createOne(
        chart,
        getTestPlotOptions(
            new CanvasCartesian2dUpdateArgProvider(),
            Range2d.f32.factory.createOne(0, 1, 0, 1),
            "plot upper right",
            Cartesian2dPlotRange.createOneF64(
                Range2d.f64.factory.createOne(-4, 4, -4, 4),
                dataRange.slice(),
                4,
                chart.attachPoint.canvasDims,
            ),
        ),
    ));
    plot2.dataCategory.addEntity(new ChartDataEntity(someData, graphicsSettings, chart.changeIdFactory), canvasLineGraphicsComponent, pointSubcategory);

    const plot2InteractionHandler = new Cartesian2dPlotSharedQuadTree(plot2, { yieldTime: 16 });
    plot2InteractionHandler.setQuadTreeInteractionHandler(emscriptenModule, chart);

    chart.updateImmediate();
    chart.updateInteractionHandlers();

    window.addEventListener("resize", _Fp.debounce(250, false, () =>
    {
        chart.updateOnNextFrame();
    }));
}

export function glTestChartGo(emscriptenModule: IEmscriptenWrapper<ICartesian2dBindings>): void
{
    const chart = GlChartFactory.createOne(
        document.getElementById("gl-chart") as HTMLElement,
        Gl2ContextAdapter,
        new ChartConfig(),
        new GlRendererOptions([], { preserveDrawingBuffer: true }),
    );

    if (chart == null)
    {
        throw new Error("failed to create renderer");
    }

    const pointSubcategory = new Point2dSubcategory(Range1d.f32.factory.createOne(10, 20));
    const graphicsSettings: TPoint2dSettings<Float32Array> = {
        pointDisplay: new Point2dDisplaySettings(
            1,
            RgbaColorPacker.packColor(255, 0, 0, 255),
            RgbaColorPacker.packColor(255, 0, 255, 255),
        ),
        pointSizeNormalizer: pointSubcategory.normalization,
        zIndexAbs: 0,
        zIndexRel: 0,
    };
    const interleavedPointTester = {
        hitAllowedComponent: new HitAlwaysAllowedComponent(),
        hitTestComponent: new SharedInterleavedPoint2dHitTestComponent(SharedInterleavedLine2dQuadIndexerFactory.createOneF32(emscriptenModule)),
    };

    const dataRange = Range2d.f32.factory.createOne(3, 5, 3, 5);
    const plot = chart.addPlot(GlCartesian2dPlotFactory.createOne(
        chart,
        getTestPlotOptions(
            new GlCartesian2dUpdateArgProvider(),
            Range2d.f32.factory.createOne(-1, 1, -1, 1),
            "plot upper right",
            Cartesian2dPlotRange.createOneF32(
                Range2d.f32.factory.createOne(-5, 5, -5, 5),
                dataRange.slice(),
                Infinity,
                chart.attachPoint.canvasDims,
            ),
        ),
    ));
    const plot2InteractionHandler = new Cartesian2dPlotSharedQuadTree(plot, { yieldTime: 16 });
    plot2InteractionHandler.setQuadTreeInteractionHandler(emscriptenModule, chart);

    const interleavedConfig = { offsets: { x: 0, y: 1, size: 2, color: 3 }, blockElementCount: 4 };
    const interleavedBindingDescriptor = SharedInterleavedConnector.getDescriptor(interleavedConfig, Float32Array);

    const pointPairBinder = new GlInterleaved2dPointBinder(interleavedBindingDescriptor, { pointsToBind: 2, byteStride: interleavedBindingDescriptor.blockByteSize * 2 });
    const pointTripletBinder = new GlInterleaved2dPointBinder(interleavedBindingDescriptor, { pointsToBind: 3, byteStride: interleavedBindingDescriptor.blockByteSize * 3 });

    pointPairBinder.mergeTracePositionBuffers([pointTripletBinder]);

    const gc = chart.renderer
        .createCompositeGraphicsComponent(new GlLineFlatCapGraphicsComponent(new GlCartesian2dCameraBinder(), pointTripletBinder), plot)
        .addComponent(new GlCaplessLineGraphicsComponent(new GlCartesian2dCameraBinder(), pointPairBinder));
    gc.groupUpdatesByEntity = true;

    for (let i = 0, iEnd = 100; i < iEnd; ++i)
    {
        const someData = SharedInterleavedConnector.createOneF32(emscriptenModule, 4000, interleavedConfig);
        populateTestData(someData, dataRange, 0, rnd);
        const entity = new ChartDataEntity(someData, graphicsSettings, chart.changeIdFactory);
        entity.onHoverChange = function (state, segments)
        {
            hoverHighlightLineSegment(this, state, segments);
            return EEntityUpdateFlag.DrawRequired;
        };
        plot.dataCategory.addEntity(entity, gc, pointSubcategory);
        plot2InteractionHandler.interactionGroups.clickable.addToGroup(entity, interleavedPointTester);
        plot2InteractionHandler.interactionGroups.hoverable.addToGroup(entity, interleavedPointTester);
    }

    chart.updateImmediate();
    chart.updateInteractionHandlers();

    window.addEventListener("resize", _Fp.debounce(250, false, () =>
    {
        chart.updateOnNextFrame();
    }));
}
