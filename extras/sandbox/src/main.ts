import { addEntityToCategory, ChartConfig, ChartDataEntity, Gl2ContextAdapter, GlChartFactory, GlRendererOptions, ISharedInterleavedConnector, SharedInterleavedConnector } from "@visualization-tools/core";
import { Cartesian2dIdentityTransform, Cartesian2dPlotRange, Cartesian2dPlotSharedQuadTree, GlCartesian2dCameraBinder, GlCartesian2dPlotFactory, GlCartesian2dUpdateArgProvider, GlInterleaved2dPointBinder, GlPoint2dGraphicsComponent, ICartesian2dBindings, Point2dDisplaySettings, Point2dSubcategory, TPoint2dSettings } from "@visualization-tools/cartesian-2d";
import { _Array, _Fp, Emscripten, getEmscriptenWrapper, IEmscriptenWrapper, Mulberry32Generator, Range1d, Range2d, RgbaColorPacker } from "rc-js-util";
import { getTestPlotOptions } from "@visualization-tools/test-data";

declare const require: (path: string) => Emscripten.EmscriptenModuleFactory<ICartesian2dBindings>;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const testModule = require("sandbox-module");
const rnd = new Mulberry32Generator(79769);

window.onload = async () =>
{
    const [emscriptenModule, testData] = await Promise.all([
            getEmscriptenWrapper(new WebAssembly.Memory({ initial: 256, maximum: 8192 }), testModule),
            fetchSkuaData("test-data/SKUA_DATA.bin"),
        ],
    );
    const skuaData = getSkuaTestData(testData, emscriptenModule);
    glTestChartGo(emscriptenModule, skuaData);
};

export async function fetchSkuaData(location: string): Promise<Float32Array>
{
    const response = await fetch(location);
    const buffer = await response.arrayBuffer();
    const testData = new Float32Array(buffer);

    for (let i = 0, iEnd = testData.length; i < iEnd; ++i)
    {
        // get psi^2 (probability of finding electron)
        testData[i] = testData[i] * testData[i];
    }

    return testData;
}

export interface ISkuaOffsets
{
    psiSquared: number;
    x: number;
    y: number;
    z: number;
    color: number;
}

/**
 * a 50x50x50 cube giving psi^2 values for an electron.
 * [psi^2, x, y, z, color]
 */
export function getSkuaTestData
(
    packedData: Float32Array,
    emscriptenModule: IEmscriptenWrapper<ICartesian2dBindings>,
)
    : ISharedInterleavedConnector<Float32Array, ISkuaOffsets>
{
    const scaleFactor = 1 / 50; // todo jack... there is an out by 1, probably best to just add a half step
    const highestProbability = _Array.max(packedData);
    const colorScaleFactor = 255 / highestProbability;
    const cubeSize = 50;
    let testIndex = 0;
    let dataIndex = 0;

    const interleavedConnector = SharedInterleavedConnector.createOneF32(
        emscriptenModule,
        packedData.length * 4,
        { blockElementCount: 4, offsets: { x: 0, y: 1, z: 2, color: 3, psiSquared: 4 } },
    );
    const testData = interleavedConnector.getInterleavedBuffer();

    for (let i = 0; i < cubeSize; ++i)
    {
        for (let j = 0; j < cubeSize; ++j)
        {
            for (let k = 0; k < cubeSize; ++k)
            {
                const psiSquared = packedData[dataIndex];
                testData[testIndex++] = i * scaleFactor;
                testData[testIndex++] = j * scaleFactor;
                testData[testIndex++] = k * scaleFactor;
                testData[testIndex++] = RgbaColorPacker.packColor(psiSquared * colorScaleFactor, 0, 0, 0);
                // todo jack: bug?
                // testData[testIndex++] = psiSquared;
                dataIndex++;
            }
        }
    }

    return interleavedConnector;
}

export function glTestChartGo
(
    emscriptenModule: IEmscriptenWrapper<ICartesian2dBindings>,
    testData: ISharedInterleavedConnector<Float32Array, ISkuaOffsets>,
)
    : void
{
    const chart = GlChartFactory.createOne({
        chartContainer: document.getElementById("gl-chart") as HTMLElement,
        contextAdapterCtor: Gl2ContextAdapter,
        chartConfig: new ChartConfig(),
        rendererOptions: new GlRendererOptions([], { preserveDrawingBuffer: true }),
    });

    if (chart == null)
    {
        throw new Error("failed to create renderer");
    }

    const pointSubcategory = new Point2dSubcategory(Range1d.f32.factory.createOne(10, 20));

    const dataRange = Range2d.f32.factory.createOne(0, 1, 0, 1);
    const plot = chart.addPlot(GlCartesian2dPlotFactory.createOne(
        chart,
        getTestPlotOptions({
            plotName: "gl plot",
            plotRange: Cartesian2dPlotRange.createOneF32({
                userTransform: new Cartesian2dIdentityTransform(),
                maxZoom: Infinity,
                dataRange: dataRange.slice(),
                maxBounds: Range2d.f32.factory.createOne(0, 1, 0, 1),
            }),
            plotPosition: Range2d.f32.factory.createOne(-1, 1, -1, 1),
            updateArgProvider: new GlCartesian2dUpdateArgProvider(),
        }),
    ));
    plot.dataCategory.setBufferPerEntity(true);
    const plotInteractionHandler = new Cartesian2dPlotSharedQuadTree(plot, { yieldTime: 16 });
    plotInteractionHandler.setQuadTreeInteractionHandler(emscriptenModule, chart);

    const pointRenderer = new GlPoint2dGraphicsComponent(new GlCartesian2dCameraBinder(), new GlInterleaved2dPointBinder(testData.getDescriptor(), { pointsToBind: 1 }));
    const settings: TPoint2dSettings<Float32Array> = {
        pointDisplay: new Point2dDisplaySettings(
            20,
            RgbaColorPacker.packColor(255, 0, 0, 255),
            RgbaColorPacker.packColor(rnd.getNext() * 255, rnd.getNext() * 255, rnd.getNext() * 255, 0),
        ),
        pointSizeNormalizer: pointSubcategory.normalization,
        zIndexAbs: 0,
        zIndexRel: 0,
    };

    const entity = new ChartDataEntity(testData, settings, chart.changeIdFactory);
    addEntityToCategory(plot.dataCategory, entity, pointRenderer, pointSubcategory);


    chart.updateImmediate();
    chart.updateInteractionHandlers();

    window.addEventListener("resize", _Fp.debounce(250, false, () =>
    {
        chart.updateOnNextFrame();
    }));
}
