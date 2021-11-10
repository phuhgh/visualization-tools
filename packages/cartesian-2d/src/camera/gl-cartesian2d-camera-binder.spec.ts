import { GlCartesian2dCameraBinder, IGlCartesian2dCameraBinder } from "./gl-cartesian2d-camera-binder";
import { Cartesian2dTransforms, ICartesian2dTransforms } from "../update/update-arg/cartesian2d-transforms";
import { IncrementingIdentifierFactory, Range2d, Vec2 } from "rc-js-util";
import { debugDescribe, ExpectColor } from "rc-js-test-util";
import { ChartDataEntity, EGraphicsComponentType, fullClipSpaceRange2d, GlFloatAttribute, GlFloatBuffer, GlProgramSpecification, GlShader, IDataTrait, IGraphicsComponent, NoTransformProvider, TGlBasicComponentRenderer } from "@visualization-tools/core";
import { TestGl2RendererHarness } from "@visualization-tools/core/bin/test-utils/test-gl2-renderer-harness";
import { debugFragmentShader } from "@visualization-tools/core/bin/test-utils/debug-fragment-shader";
import { updateTestGc } from "@visualization-tools/core/bin/test-utils/update-test-gc";

debugDescribe("GlCartesian2dCameraBinder", () =>
{
    const changeIdFactory = new IncrementingIdentifierFactory();
    let points: Float32Array;
    let testRendererHarness: TestGl2RendererHarness;
    let camera: ICartesian2dTransforms<Float32Array>;

    beforeEach(() =>
    {
        testRendererHarness = new TestGl2RendererHarness([], Vec2.f32.factory.createOne(20, 20));
        testRendererHarness.attachToBody();
        camera = new Cartesian2dTransforms(Float32Array);
    });

    afterEach(() =>
    {
        testRendererHarness.removeFromBody();
    });

    it("| draws a red triangle in the bottom left filling half the canvas", () =>
    {
        points = new Float32Array([
            0, 0,
            1, 0,
            0, 1,
        ]);

        camera.update(
            Range2d.f32.factory.createOne(0, 1, 0, 1),
            fullClipSpaceRange2d,
            fullClipSpaceRange2d,
        );
        draw();

        ExpectColor.red(testRendererHarness.readPixels(0, 0), "bottom left");
        ExpectColor.red(testRendererHarness.readPixels(18, 0), "bottom right");
        ExpectColor.red(testRendererHarness.readPixels(0, 18), "top left");
        ExpectColor.transparentBlack(testRendererHarness.readPixels(5, 19), "outside mid upper");
        ExpectColor.transparentBlack(testRendererHarness.readPixels(19, 5), "outside mid lower");
    });

    function draw(): void
    {
        const testEntity = new ChartDataEntity(points, {}, changeIdFactory);
        testEntity.changeId = 1;
        const testGraphicsComponent = new GlTestGraphicsComponent(new GlCartesian2dCameraBinder());

        updateTestGc(testRendererHarness, testGraphicsComponent, testEntity, camera);
    }
});

class GlTestGraphicsComponent
    implements IGraphicsComponent<TGlBasicComponentRenderer, ICartesian2dTransforms<Float32Array>, IDataTrait<Float32Array>>
{
    public readonly type = EGraphicsComponentType.Entity;
    public transform = new NoTransformProvider();
    public specification = GlProgramSpecification.mergeProgramSpecifications([
        this.cameraBinder.specification,
        new GlProgramSpecification(
            // language=GLSL prefix="#if __VERSION__ >=300 && __VERSION__ < 400 \n #define ATTRIBUTE in \n #define VARYING out \n #else \n #define ATTRIBUTE attribute \n #define VARYING varying \n #endif"
            new GlShader(`
            /* === test shader === */
            VARYING lowp vec4 test_color;
            ATTRIBUTE highp vec2 test_position;

            void main()
            {
                test_color = vec4(1, 0, 0, 1);
                gl_Position = vec4(v_2dCamera_getClipspaceCoords2d(test_position), 1);
            }

            `),
            debugFragmentShader,
        ),
    ]);

    public constructor
    (
        private cameraBinder: IGlCartesian2dCameraBinder,
    )
    {
    }

    public getCacheId(): string
    {
        return "GlTestSpec";
    }

    public initialize(componentRenderer: TGlBasicComponentRenderer): void
    {
        this.testDataAttribute.initialize(componentRenderer);
        this.cameraBinder.initialize(componentRenderer);
    }

    public onBeforeUpdate(): void
    {
        // no action needed
    }

    public update(entity: IDataTrait<Float32Array>, componentRenderer: TGlBasicComponentRenderer, transforms: ICartesian2dTransforms<Float32Array>): void
    {
        this.testDataAttribute.setData(entity.data, 0);

        const ctx = componentRenderer.context;
        this.testDataAttribute.bindArray(componentRenderer);
        this.cameraBinder.update({ transforms: transforms, changeId: componentRenderer.sharedState.frameCounter }, componentRenderer);

        ctx.drawArrays(ctx.TRIANGLES, 0, entity.data.length / this.testDataAttribute.componentsPerVertex);
    }

    private testDataAttribute = new GlFloatAttribute(
        "test_position",
        new GlFloatBuffer(null),
        2,
    );
}
