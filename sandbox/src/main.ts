import { addEntityToCategory, CanvasChartFactory, ChartConfig, ChartDataEntity, CompositeGraphicsComponent, EEntityUpdateFlag, Gl2ContextAdapter, GlChartFactory, GlRendererOptions, HitAlwaysAllowedComponent, SharedInterleavedConnector } from "@visualization-tools/core";
import { CanvasCartesian2dPlotFactory, CanvasCartesian2dUpdateArgProvider, CanvasLineGraphicsComponent, Cartesian2dIdentityTransform, Cartesian2dNaturalLogTransform, Cartesian2dPlotRange, Cartesian2dPlotSharedQuadTree, GlCaplessLineGraphicsComponent, GlCartesian2dCameraBinder, GlCartesian2dPlotFactory, GlCartesian2dUpdateArgProvider, GlInterleaved2dPointBinder, GlLineFlatCapGraphicsComponent, GlPoint2dNaturalLogTransformComponent, GlTrace2dNaturalLogTransformComponent, hoverHighlightLineSegment, ICartesian2dBindings, Point2dDisplaySettings, Point2dSubcategory, SharedInterleavedLine2dQuadIndexerFactory, SharedInterleavedPoint2dHitTestComponent, TPoint2dSettings } from "@visualization-tools/cartesian-2d";
import { getTestPlotOptions } from "./test-data/get-test-plot-options";
import { populateTestData } from "./test-data/populate-test-data";
import { _Array, _Fp, Emscripten, getEmscriptenWrapper, IEmscriptenWrapper, Mulberry32Generator, Range1d, Range2d, RgbaColorPacker } from "rc-js-util";

declare const require: (path: string) => Emscripten.EmscriptenModuleFactory<ICartesian2dBindings>;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const testModule = require("sandbox-module");
const rnd = new Mulberry32Generator(79769);

window.onload = async () =>
{
    const emscriptenModule = await getEmscriptenWrapper(new WebAssembly.Memory({ initial: 256, maximum: 8192 }), testModule);
    canvasTestChartGo(emscriptenModule);
    glTestChartGo(emscriptenModule);
};

export function canvasTestChartGo(emscriptenModule: IEmscriptenWrapper<ICartesian2dBindings>): void
{
    const dataRange = Range2d.f64.factory.createOne(1, 10, 1, 10);
    const chart = CanvasChartFactory.createOne(document.getElementById("canvas-chart") as HTMLElement, new ChartConfig());
    const pointSubcategory = new Point2dSubcategory(Range1d.f64.factory.createOne(10, 20));
    const graphicsSettings: TPoint2dSettings<Float64Array> = {
        pointDisplay: new Point2dDisplaySettings(
            5,
            RgbaColorPacker.packColor(130, 0, 255, 255),
            RgbaColorPacker.packColor(0, 130, 255, 255),
        ),
        pointSizeNormalizer: pointSubcategory.normalization,
        zIndexAbs: 0,
        zIndexRel: 0,
    };
    const interleavedPointTester = {
        hitAllowedComponent: new HitAlwaysAllowedComponent(),
        hitTestComponent: new SharedInterleavedPoint2dHitTestComponent(SharedInterleavedLine2dQuadIndexerFactory.createOneF64(emscriptenModule)),
    };

    if (chart == null)
    {
        throw new Error("failed to create renderer");
    }

    const canvasLineGraphicsComponent = new CanvasLineGraphicsComponent();

    const plot1 = chart.addPlot(CanvasCartesian2dPlotFactory.createOne(
        chart,
        getTestPlotOptions({
            plotName: "plot lower left",
            plotRange: Cartesian2dPlotRange.createOneF64({
                canvasDims: chart.attachPoint.canvasDims,
                userTransform: new Cartesian2dNaturalLogTransform(false, true),
                maxZoom: 1,
                dataRange: dataRange.slice(),
                maxBounds: dataRange.slice(),
            }),
            plotPosition: Range2d.f32.factory.createOne(-1, 0, -1, 0),
            updateArgProvider: new CanvasCartesian2dUpdateArgProvider(),
        }),
    ));
    const plot1InteractionHandler = new Cartesian2dPlotSharedQuadTree(plot1, { yieldTime: 16 });
    plot1InteractionHandler.setQuadTreeInteractionHandler(emscriptenModule, chart);

    const plot2 = chart.addPlot(CanvasCartesian2dPlotFactory.createOne(
        chart,
        getTestPlotOptions({
            plotName: "plot upper right",
            plotRange: Cartesian2dPlotRange.createOneF64({
                canvasDims: chart.attachPoint.canvasDims,
                userTransform: new Cartesian2dIdentityTransform(),
                maxZoom: 100,
                dataRange: dataRange.slice(),
                maxBounds: Range2d.f64.factory.createOne(1, 100, 1, 100),
            }),
            plotPosition: Range2d.f32.factory.createOne(0, 1, 0, 1),
            updateArgProvider: new CanvasCartesian2dUpdateArgProvider(),
        }),
    ));
    const plot2InteractionHandler = new Cartesian2dPlotSharedQuadTree(plot2, { yieldTime: 16 });
    plot2InteractionHandler.setQuadTreeInteractionHandler(emscriptenModule, chart);

    for (let i = 0; i < 50; ++i)
    {
        const someData = SharedInterleavedConnector.createOneF64(emscriptenModule, 180, { offsets: { x: 0, y: 1, size: 2, color: 3 }, blockElementCount: 4 });
        populateTestData(someData, dataRange, 255, rnd);

        const p1Entity = new ChartDataEntity(someData, graphicsSettings, chart.changeIdFactory);
        p1Entity.onHover = function (state, segments)
        {
            hoverHighlightLineSegment(this, state, segments);
            return EEntityUpdateFlag.DrawRequired;
        };

        plot1.dataCategory.addEntity(p1Entity, canvasLineGraphicsComponent, pointSubcategory);
        plot1InteractionHandler.interactionGroups.hoverable.addToGroup(p1Entity, interleavedPointTester);

        plot2.dataCategory.addEntity(new ChartDataEntity(someData, graphicsSettings, chart.changeIdFactory), canvasLineGraphicsComponent, pointSubcategory);
    }

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

    const transformProvider = chart.getTransformProvider([Cartesian2dNaturalLogTransform.transformId], true);
    GlTrace2dNaturalLogTransformComponent.factory.addToChart(transformProvider);
    GlPoint2dNaturalLogTransformComponent.factory.addToChart(transformProvider);

    const pointSubcategory = new Point2dSubcategory(Range1d.f32.factory.createOne(10, 20));
    const interleavedPointTester = {
        hitAllowedComponent: new HitAlwaysAllowedComponent(),
        hitTestComponent: new SharedInterleavedPoint2dHitTestComponent(SharedInterleavedLine2dQuadIndexerFactory.createOneF32(emscriptenModule)),
    };

    const userTransform = new Cartesian2dNaturalLogTransform(true, true);
    const dataRange = Range2d.f32.factory.createOne(1, 10, 1, 10);
    const plot = chart.addPlot(GlCartesian2dPlotFactory.createOne(
        chart,
        getTestPlotOptions({
            plotName: "gl plot",
            plotRange: Cartesian2dPlotRange.createOneF32({
                canvasDims: chart.attachPoint.canvasDims,
                userTransform: userTransform,
                maxZoom: Infinity,
                dataRange: dataRange.slice(),
                maxBounds: Range2d.f32.factory.createOne(1, 100, 1, 100),
            }),
            plotPosition: Range2d.f32.factory.createOne(-1, 1, -1, 1),
            updateArgProvider: new GlCartesian2dUpdateArgProvider(),
        }),
    ));
    plot.dataCategory.setBufferPerEntity(true);
    const plotInteractionHandler = new Cartesian2dPlotSharedQuadTree(plot, { yieldTime: 16 });
    plotInteractionHandler.setQuadTreeInteractionHandler(emscriptenModule, chart);

    const interleavedConfig = { offsets: { x: 0, y: 1, size: 2, color: 3 }, blockElementCount: 4 };
    const interleavedBindingDescriptor = SharedInterleavedConnector.getDescriptor(interleavedConfig, Float32Array);

    const lineGc = CompositeGraphicsComponent
        .createOneLinked(new GlCaplessLineGraphicsComponent(new GlCartesian2dCameraBinder(), new GlInterleaved2dPointBinder(interleavedBindingDescriptor, { pointsToBind: 2 })))
        .addComponent(new GlLineFlatCapGraphicsComponent(new GlCartesian2dCameraBinder(), new GlInterleaved2dPointBinder(interleavedBindingDescriptor, { pointsToBind: 3 })))
        .build();

    const settings: TPoint2dSettings<Float32Array>[] = _Array.mapRange(0, 24, () => ({
        pointDisplay: new Point2dDisplaySettings(
            1,
            RgbaColorPacker.packColor(255, 0, 0, 255),
            RgbaColorPacker.packColor(rnd.getNext() * 255, rnd.getNext() * 255, rnd.getNext() * 255, 0),
        ),
        pointSizeNormalizer: pointSubcategory.normalization,
        zIndexAbs: 0,
        zIndexRel: 0,
    }));


    const dataEntities = _Array.mapRange(0, 249, (index) =>
    {
        const someData = SharedInterleavedConnector.createOneF32(emscriptenModule, 2000, interleavedConfig);
        populateTestData(someData, dataRange, 0, rnd);

        const entity = new ChartDataEntity(someData, settings[index * 0.1 | 0], chart.changeIdFactory);
        entity.onHover = function (state, segments)
        {
            const groupStart = (index * 0.1 | 0) * 10;
            hoverHighlightLineSegment(this, state, segments);
            _Array.forEachRange(groupStart, groupStart + 9, (index) => dataEntities[index].updateChangeId());
            return EEntityUpdateFlag.DrawRequired;
        };

        entity.onClick = function ()
        {
            plot.removeEntity(this);
            return EEntityUpdateFlag.DrawRequired;
        };

        return entity;
    });

    _Array.forEach(dataEntities, (entity) =>
    {
        addEntityToCategory(plot.dataCategory, entity, lineGc, pointSubcategory);
        plotInteractionHandler.interactionGroups.clickable.addToGroup(entity, interleavedPointTester);
        plotInteractionHandler.interactionGroups.hoverable.addToGroup(entity, interleavedPointTester);
    });

    chart.updateImmediate();
    chart.updateInteractionHandlers();

    window.addEventListener("resize", _Fp.debounce(250, false, () =>
    {
        chart.updateOnNextFrame();
    }));
}
