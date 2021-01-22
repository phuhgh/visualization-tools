import { GlInterleaved2dPointBinder } from "./gl-interleaved-2d-point-binder";
import { IncrementingIdentifierFactory, Range1d, RgbaColorPacker, Vec2 } from "rc-js-util";
import { IDrawablePoint2dOffsets } from "../../series/i-drawable-point2d-offsets";
import { IPoint2dOffsets } from "../../series/i-point2d-offsets";
import { TInterleavedPoint2dTrait } from "../../traits/t-interleaved-point2d-trait";
import { TIndexedPointTrait } from "../../traits/t-indexed-point-trait";
import { Point2dDisplaySettings } from "../../traits/t-point2d-display-settings-trait";
import { Point2dSizeNormalizer } from "../../traits/t-point2d-size-normalizer-trait";
import { debugDescribe, ExpectColor } from "rc-js-test-util";
import { TestGl2RendererHarness } from "@visualization-tools/core/bin/test-utils/test-gl2-renderer-harness";
import { ChartDataEntity, GlProgramSpecification, GlShader, IGlInstancedBinder, IGraphicsComponentSpecification, InterleavedConnector, TGlInstancedEntityRenderer } from "@visualization-tools/core";
import { debugFragmentShader } from "@visualization-tools/core/bin/test-utils/debug-fragment-shader";

debugDescribe("=> GlInterleavedPointBinder", () =>
{
    const changeIdFactory = new IncrementingIdentifierFactory();
    let connector: InterleavedConnector<Float32Array, IPoint2dOffsets>;
    let binder: GlInterleaved2dPointBinder;
    let testRendererHarness: TestGl2RendererHarness<never>;

    beforeEach(() =>
    {
        testRendererHarness = new TestGl2RendererHarness([], Vec2.f32.factory.createOne(20, 20));
        testRendererHarness.attachToBody();
    });

    afterEach(() =>
    {
        testRendererHarness.removeFromBody();
    });

    describe("=> single point ", () =>
    {
        const sizeNormalization = new Point2dSizeNormalizer<Float32Array>(Range1d.f32.factory.createOne(20, 60));
        sizeNormalization.extendDataRange(1, 3);

        describe("=> with only position inputs", () =>
        {
            beforeEach(() =>
            {
                connector = new InterleavedConnector(new Float32Array([
                    -0.25, 0.25,
                    -0.25, -0.25,
                    0.25, -0.25,
                ]), { offsets: { x: 0, y: 1 }, blockElementCount: 2 });
                binder = new GlInterleaved2dPointBinder(connector.getDescriptor());
            });

            it("| draws a red rectangle", () =>
            {
                draw(new Point2dDisplaySettings(2, RgbaColorPacker.packColor(255, 0, 0, 255)), sizeNormalization);

                ExpectColor.transparentBlack(testRendererHarness.readPixels(4, 10), "outside top left");
                ExpectColor.transparentBlack(testRendererHarness.readPixels(10, 4), "outside bottom right");
                ExpectColor.transparentBlack(testRendererHarness.readPixels(12, 12), "outside hypotenuse");
                ExpectColor.red(testRendererHarness.readPixels(5, 13), "inside top left");
                ExpectColor.red(testRendererHarness.readPixels(13, 5), "inside bottom right");
                ExpectColor.red(testRendererHarness.readPixels(5, 5), "center");
            });
        });

        describe("=> with color input", () =>
        {
            beforeEach(() =>
            {
                connector = new InterleavedConnector<Float32Array, IDrawablePoint2dOffsets>(new Float32Array([
                    -0.25, 0.25, RgbaColorPacker.packColor(255, 0, 0, 255),
                    -0.25, -0.25, RgbaColorPacker.packColor(0, 255, 0, 255),
                    0.25, -0.25, RgbaColorPacker.packColor(0, 0, 255, 255),
                ]), { offsets: { x: 0, y: 1, color: 2 }, blockElementCount: 3 });
                binder = new GlInterleaved2dPointBinder(connector.getDescriptor());
            });

            it("| draws a red blue green triangle", () =>
            {
                draw(new Point2dDisplaySettings(2, RgbaColorPacker.packColor(0, 0, 0, 0)), sizeNormalization);

                ExpectColor.transparentBlack(testRendererHarness.readPixels(4, 10), "outside top left");
                ExpectColor.transparentBlack(testRendererHarness.readPixels(10, 4), "outside bottom right");
                ExpectColor.transparentBlack(testRendererHarness.readPixels(12, 12), "outside hypotenuse");
                ExpectColor.reddish(testRendererHarness.readPixels(5, 13), "inside top left");
                ExpectColor.blueish(testRendererHarness.readPixels(13, 5), "inside bottom right");
                ExpectColor.greenish(testRendererHarness.readPixels(5, 5), "center");
            });
        });

        describe("=> with size input", () =>
        {
            beforeEach(() =>
            {
                connector = new InterleavedConnector<Float32Array, IDrawablePoint2dOffsets>(new Float32Array([
                    -0.025, -0.025, 1,
                    0.025, -0.025, 2,
                    -0.025, 0.025, 1.5,
                ]), { offsets: { x: 0, y: 1, size: 2 }, blockElementCount: 3 });
                binder = new GlInterleaved2dPointBinder(connector.getDescriptor());
            });

            it("| draws a screwed red rectangle", () =>
            {
                // the bottom left should be at (0.5, 0.5), other positions should be * size
                draw(new Point2dDisplaySettings(1, RgbaColorPacker.packColor(255, 0, 0, 255)), sizeNormalization);

                ExpectColor.red(testRendererHarness.readPixels(5, 5), "inside bottom left");
                ExpectColor.red(testRendererHarness.readPixels(3, 15), "inside top left");
                ExpectColor.red(testRendererHarness.readPixels(18, 0), "inside bottom right");
                ExpectColor.transparentBlack(testRendererHarness.readPixels(4, 16), "outside top left");
                ExpectColor.transparentBlack(testRendererHarness.readPixels(4, 4), "outside bottom left");
                ExpectColor.transparentBlack(testRendererHarness.readPixels(19, 0), "outside bottom right");
                ExpectColor.transparentBlack(testRendererHarness.readPixels(10, 11), "outside hypotenuse");

            });
        });

        function draw(displayConfig: Point2dDisplaySettings, normalizationConfig: Point2dSizeNormalizer<Float32Array>)
        {
            const testGraphicsComponent = new SinglePointTestGraphicsComponent(binder);
            const entityRenderer = testRendererHarness.renderer.entityRendererFactory.createRenderer(testGraphicsComponent.specification);
            entityRenderer.useProgram();
            testGraphicsComponent.initialize(entityRenderer);
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
            testGraphicsComponent.update(testEntity, entityRenderer);
        }
    });

    describe("=> binding two points", () =>
    {
        describe("=> with only position inputs", () =>
        {
            beforeEach(() =>
            {
                connector = new InterleavedConnector(new Float32Array([
                    0.25, -0.25,
                    0.25, 0.25,
                    0, 0.25,
                    0, -0.25,
                    -0.25, -0.25,
                    -0.25, 0.25,
                ]), { offsets: { x: 0, y: 1 }, blockElementCount: 2 });
                binder = new GlInterleaved2dPointBinder(connector.getDescriptor(), { pointsToBind: 2, byteStride: connector.getBlockByteSize() * 2 });
            });

            it("| draws a red rectangle", () =>
            {
                draw(false);
                ExpectColor.red(testRendererHarness.readPixels(5, 5), "bottom left");
                ExpectColor.red(testRendererHarness.readPixels(14, 5), "bottom right");
                ExpectColor.red(testRendererHarness.readPixels(9, 13), "top center");
                ExpectColor.transparentBlack(testRendererHarness.readPixels(4, 5), "outside bottom left");
                ExpectColor.transparentBlack(testRendererHarness.readPixels(15, 5), "outside bottom right");
                ExpectColor.transparentBlack(testRendererHarness.readPixels(9, 14), "outside top center");
            });

            it("| draws an upside down red rectangle", () =>
            {
                draw(true);
                ExpectColor.red(testRendererHarness.readPixels(5, 14), "top left");
                ExpectColor.red(testRendererHarness.readPixels(14, 14), "top right");
                ExpectColor.red(testRendererHarness.readPixels(9, 6), "bottom center");
                ExpectColor.transparentBlack(testRendererHarness.readPixels(4, 14), "outside top left");
                ExpectColor.transparentBlack(testRendererHarness.readPixels(15, 14), "outside top right");
                ExpectColor.transparentBlack(testRendererHarness.readPixels(9, 5), "outside bottom center");
            });
        });

        function draw(useSecondPoint: boolean)
        {
            const config = new Point2dDisplaySettings(2, RgbaColorPacker.packColor(255, 0, 0, 255));
            const normalization = new Point2dSizeNormalizer(Range1d.f32.factory.createOne(10, 20));
            normalization.extendDataRange(0, 1);
            const testGraphicsComponent = new TwoPointTestGraphicsComponent(binder, useSecondPoint);
            const entityRenderer = testRendererHarness.renderer.entityRendererFactory.createRenderer(testGraphicsComponent.specification);
            entityRenderer.useProgram();
            testGraphicsComponent.initialize(entityRenderer);
            const testEntity = new ChartDataEntity(
                connector,
                {
                    pointDisplay: config,
                    pointSizeNormalizer: normalization,
                    zIndexAbs: 0,
                    zIndexRel: 1,
                },
                changeIdFactory,
            );
            testGraphicsComponent.update(testEntity, entityRenderer);
        }
    });
});

class SinglePointTestGraphicsComponent
    implements IGraphicsComponentSpecification<TGlInstancedEntityRenderer, void, TInterleavedPoint2dTrait<Float32Array>>
{
    public specification = GlProgramSpecification.mergeProgramSpecifications([
        this.dataBinder.specification,
        new GlProgramSpecification(
            // language=GLSL prefix="#if __VERSION__ >=300 && __VERSION__ < 400 \n #define ATTRIBUTE in \n #define VARYING out \n #else \n #define ATTRIBUTE attribute \n #define VARYING varying \n #endif"
            new GlShader(`
            /* === test shader === */
            VARYING lowp vec4 test_color;

            void main()
            {
                test_color = pointConnector_getColor();
                gl_Position = vec4(pointConnector_getPosition() * pointConnector_getSize(), 0, 1);
            }

            `),
            debugFragmentShader,
        ),
    ]);

    public constructor
    (
        private readonly dataBinder: IGlInstancedBinder<TInterleavedPoint2dTrait<Float32Array>, TGlInstancedEntityRenderer>,
    )
    {
    }

    public getCacheId(): string
    {
        return "GlTestSpec";
    }

    public initialize(entityRenderer: TGlInstancedEntityRenderer): void
    {
        this.dataBinder.initialize(entityRenderer);
    }

    public onBeforeUpdate(): void
    {
        // no action needed
    }

    public update(entity: TInterleavedPoint2dTrait<Float32Array>, entityRenderer: TGlInstancedEntityRenderer): void
    {
        this.dataBinder.update(entity, entityRenderer);
        const ctx = entityRenderer.context;
        ctx.drawArrays(ctx.TRIANGLES, 0, entity.data.getLength());
    }
}

class TwoPointTestGraphicsComponent
    implements IGraphicsComponentSpecification<TGlInstancedEntityRenderer, void, TIndexedPointTrait<Float32Array, IDrawablePoint2dOffsets>>
{
    public specification = GlProgramSpecification.mergeProgramSpecifications([
        this.dataBinder.specification,
        new GlProgramSpecification(
            // language=GLSL prefix="#if __VERSION__ >=300 && __VERSION__ < 400 \n #define ATTRIBUTE in \n #define VARYING out \n #else \n #define ATTRIBUTE attribute \n #define VARYING varying \n #endif"
            new GlShader(`
            /* === test shader === */
            VARYING lowp vec4 test_color;
            uniform lowp int test_useSecond;

            void main()
            {
                if (test_useSecond == 0)
                {
                    test_color = pointConnector_getColor();
                    gl_Position = vec4(pointConnector_getPosition() * pointConnector_getSize(), 0, 1);
                }
                else
                {
                    test_color = pointConnector_getColor1();
                    gl_Position = vec4(pointConnector_getPosition1() * pointConnector_getSize1(), 0, 1);
                }
            }

            `),
            debugFragmentShader,
        ),
    ]);

    public constructor
    (
        private readonly dataBinder: IGlInstancedBinder<TIndexedPointTrait<Float32Array, IDrawablePoint2dOffsets>, TGlInstancedEntityRenderer>,
        private useSecondPoint: boolean,
    )
    {
    }

    public getCacheId(): string
    {
        return "GlTestSpec";
    }

    public initialize(entityRenderer: TGlInstancedEntityRenderer): void
    {
        this.dataBinder.initialize(entityRenderer);
    }

    public onBeforeUpdate(): void
    {
        // no action needed
    }

    public update(entity: TIndexedPointTrait<Float32Array, IDrawablePoint2dOffsets>, entityRenderer: TGlInstancedEntityRenderer): void
    {
        this.dataBinder.update(entity, entityRenderer);
        const ctx = entityRenderer.context;
        const loc = entityRenderer.context.getUniformLocation(entityRenderer.program, "test_useSecond");
        entityRenderer.context.uniform1i(loc, this.useSecondPoint ? 1 : 0);

        ctx.drawArrays(ctx.TRIANGLES, 0, entity.data.getLength() / 2);
    }
}