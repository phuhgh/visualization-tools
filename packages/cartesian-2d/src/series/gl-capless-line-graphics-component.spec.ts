import { IncrementingIdentifierFactory, Range1d, RgbaColorPacker, Vec2 } from "rc-js-util";
import { GlCartesian2dCameraBinder } from "../camera/gl-cartesian2d-camera-binder";
import { GlInterleaved2dPointBinder } from "../indexed-point-2d/interleaved/gl-interleaved-2d-point-binder";
import { IDrawablePoint2dOffsets } from "./i-drawable-point2d-offsets";
import { IPoint2dOffsets } from "./i-point2d-offsets";
import { TestCartesian2dUpdateArgProvider } from "./test-cartesian2d-update-arg-provider";
import { GlCaplessLineGraphicsComponent } from "./gl-capless-line-graphics-component";
import { Point2dDisplaySettings } from "../traits/t-point2d-display-settings-trait";
import { Point2dSizeNormalizer } from "../traits/t-point2d-size-normalizer-trait";
import { debugDescribe, ExpectColor } from "rc-js-test-util";
import { ChartDataEntity, InterleavedConnector, TGlEntityRenderer } from "@visualization-tools/core";
import { TestGl2RendererHarness } from "@visualization-tools/core/bin/test-utils/test-gl2-renderer-harness";

debugDescribe("=> GlCaplessLineGraphicsComponent", () =>
{
    let connector: InterleavedConnector<Float32Array, IPoint2dOffsets>;
    let pointBinder: GlInterleaved2dPointBinder;
    let gc: GlCaplessLineGraphicsComponent;
    let entityRenderer: TGlEntityRenderer<WebGL2RenderingContext, never>;
    let testRendererHarness: TestGl2RendererHarness<never>;
    let argProvider: TestCartesian2dUpdateArgProvider<Float32ArrayConstructor>;
    const changeIdFactory = new IncrementingIdentifierFactory();

    beforeAll(() =>
    {
        const canvasDims = Vec2.f32.factory.createOne(20, 20);
        testRendererHarness = new TestGl2RendererHarness([], canvasDims);
        testRendererHarness.attachToBody();
        argProvider = new TestCartesian2dUpdateArgProvider(Float32Array, canvasDims);
    });

    afterAll(() =>
    {
        testRendererHarness.removeFromBody();
    });

    afterEach(() =>
    {
        testRendererHarness.reset();
        entityRenderer.onAfterDraw();
    });

    const sizeNormalization = new Point2dSizeNormalizer<Float32Array>(Range1d.f32.factory.createOne(2, 10));
    sizeNormalization.extendDataRange(1, 2);

    describe("=> with only position inputs", () =>
    {
        beforeEach(() =>
        {
            connector = new InterleavedConnector(new Float32Array([
                1, 1,
                3, 2,
            ]), { offsets: { x: 0, y: 1 }, blockElementCount: 2 });
            pointBinder = new GlInterleaved2dPointBinder(connector.getDescriptor(), { pointsToBind: 2 });
        });

        it("| draws a red line", () =>
        {
            draw(new Point2dDisplaySettings(2, RgbaColorPacker.packColor(255, 0, 0, 255)), sizeNormalization);

            ExpectColor.reddish(testRendererHarness.readPixels(5, 4), "line start");
            ExpectColor.reddish(testRendererHarness.readPixels(14, 9), "line end");
            ExpectColor.transparentBlack(testRendererHarness.readPixels(10, 4), "outside top");
            ExpectColor.transparentBlack(testRendererHarness.readPixels(10, 12), "outside bottom");
            ExpectColor.transparentBlack(testRendererHarness.readPixels(3, 4), "outside left");
            ExpectColor.transparentBlack(testRendererHarness.readPixels(15, 9), "outside right");
        });
    });

    describe("=> with color input", () =>
    {
        beforeEach(() =>
        {
            connector = new InterleavedConnector<Float32Array, IDrawablePoint2dOffsets>(new Float32Array([
                1, 1, RgbaColorPacker.packColor(255, 0, 0, 255),
                3, 2, RgbaColorPacker.packColor(0, 255, 0, 255),
            ]), { offsets: { x: 0, y: 1, color: 2 }, blockElementCount: 3 });
            pointBinder = new GlInterleaved2dPointBinder(connector.getDescriptor(), { pointsToBind: 2 });
        });

        it("| draws a red and green line", () =>
        {
            draw(new Point2dDisplaySettings(2, RgbaColorPacker.packColor(0, 0, 0, 0)), sizeNormalization);

            ExpectColor.reddish(testRendererHarness.readPixels(5, 4), "line start");
            ExpectColor.greenish(testRendererHarness.readPixels(14, 9), "line end");
            ExpectColor.transparentBlack(testRendererHarness.readPixels(10, 4), "outside top");
            ExpectColor.transparentBlack(testRendererHarness.readPixels(10, 12), "outside bottom");
            ExpectColor.transparentBlack(testRendererHarness.readPixels(3, 4), "outside left");
            ExpectColor.transparentBlack(testRendererHarness.readPixels(15, 9), "outside right");
        });
    });

    describe("=> with size input", () =>
    {
        beforeEach(() =>
        {
            connector = new InterleavedConnector<Float32Array, IDrawablePoint2dOffsets>(new Float32Array([
                0.5, 2, 1,
                3.5, 2, 2,
            ]), { offsets: { x: 0, y: 1, size: 2 }, blockElementCount: 3 });
            pointBinder = new GlInterleaved2dPointBinder(connector.getDescriptor(), { pointsToBind: 2 });
        });

        it("| draws a red line that is wider on the right", () =>
        {
            draw(new Point2dDisplaySettings(1, RgbaColorPacker.packColor(255, 0, 0, 255)), sizeNormalization);

            ExpectColor.reddish(testRendererHarness.readPixels(2, 9), "line start");
            ExpectColor.reddish(testRendererHarness.readPixels(16, 14), "line end top");
            ExpectColor.reddish(testRendererHarness.readPixels(16, 5), "line end end");
            ExpectColor.transparentBlack(testRendererHarness.readPixels(1, 9), "outside left");
            ExpectColor.transparentBlack(testRendererHarness.readPixels(16, 15), "outside top");
            ExpectColor.transparentBlack(testRendererHarness.readPixels(16, 4), "outside bottom");

        });
    });

    function draw
    (
        displayConfig: Point2dDisplaySettings,
        normalizationConfig: Point2dSizeNormalizer<Float32Array>,
    )
        : void
    {
        gc = new GlCaplessLineGraphicsComponent(new GlCartesian2dCameraBinder(), pointBinder);
        entityRenderer = testRendererHarness.renderer.entityRendererFactory.createRenderer(gc.specification);
        entityRenderer.useProgram();
        gc.initialize(entityRenderer);
        const testEntity = new ChartDataEntity(
            connector,
            {
                pointDisplay: displayConfig,
                pointSizeNormalizer: normalizationConfig,
                zIndexAbs: 0,
                zIndexRel: 1,
            },
            changeIdFactory,
        );
        const updateArg = argProvider.createTestCartesian2dUpdateArg();
        gc.onBeforeUpdate(entityRenderer, updateArg);
        gc.update(testEntity, entityRenderer, updateArg);
    }
});