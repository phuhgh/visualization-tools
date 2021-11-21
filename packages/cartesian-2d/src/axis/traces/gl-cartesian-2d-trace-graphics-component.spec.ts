import { GlCartesian2dTraceBinder } from "./gl-cartesian-2d-trace-binder";
import { IncrementingIdentifierFactory, Range2d, RgbaColorPacker, Vec2 } from "rc-js-util";
import { GlCartesian2dTraceGraphicsComponent } from "./gl-cartesian-2d-trace-graphics-component";
import { Cartesian2dTransforms } from "../../update/update-arg/cartesian2d-transforms";
import { GlCartesian2dCameraBinder } from "../../camera/gl-cartesian2d-camera-binder";
import { TestTraceConnector } from "../populate-cartesian-2d-trace-bindings.spec";
import { ICartesian2dUpdateArg } from "../../update/update-arg/cartesian2d-update-arg";
import { populateCartesian2dTraceBindings } from "../populate-cartesian-2d-trace-bindings";
import { debugDescribe, ExpectColor } from "rc-js-test-util";
import { TestGl2RendererHarness } from "@visualization-tools/core/bin/test-utils/test-gl2-renderer-harness";
import { CanvasDimensions, ChartDataEntity, fullClipSpaceRange2d, PlotArea, PlotDimensions } from "@visualization-tools/core";
import { Cartesian2dIdentityTransform } from "../../update/user-transforms/cartesian2d-identity-transform";
import { TGlTraceEntity } from "./t-gl-trace-entity";
import { updateTestGc } from "@visualization-tools/core/bin/test-utils/update-test-gc";

debugDescribe("GlTraceGraphicsComponent", () =>
{
    const changeIdFactory = new IncrementingIdentifierFactory();
    let testRendererHarness: TestGl2RendererHarness;
    const traceConnector = new TestTraceConnector();
    const transforms = new Cartesian2dTransforms(Float32Array);

    beforeEach(() =>
    {
        transforms.update(
            traceConnector.dataRange,
            Range2d.f32.factory.createOne(-1, -1, -1, 1),
            Range2d.f32.factory.createOne(-1, 1, -1, 1),
        );
        testRendererHarness = new TestGl2RendererHarness([], Vec2.f32.factory.createOne(20, 20));
        testRendererHarness.attachToBody();

    });

    afterEach(() =>
    {
        testRendererHarness.removeFromBody();
    });

    it("| draws 4 traces, with the 5th (y) offscreen", () =>
    {
        const canvasDims = new CanvasDimensions(
            1,
            Range2d.f32.factory.createOne(0, 20, 0, 20),
            Range2d.f32.factory.createOne(0, 20, 0, 20),
            new Range2d.f32(),
        );
        const arg: ICartesian2dUpdateArg<Float32Array> = {
            drawTransforms: transforms,
            interactionTransforms: transforms,
            plotRange: traceConnector.dataRange,
            transformedDataRange: traceConnector.dataRange,
            userTransform: new Cartesian2dIdentityTransform(),
            plotDimensionsOTL: PlotDimensions.createOneOTL(
                new PlotArea(
                    fullClipSpaceRange2d,
                    fullClipSpaceRange2d,
                ),
                canvasDims,
            ),
            plotDimensionsOBL: PlotDimensions.createOneOBL(
                new PlotArea(
                    fullClipSpaceRange2d,
                    fullClipSpaceRange2d,
                ),
                canvasDims,
            ),
            canvasDimensions: canvasDims,
        };

        draw(arg);

        ExpectColor.red(testRendererHarness.readPixels(0, 5), "first y trace");
        ExpectColor.transparentBlack(testRendererHarness.readPixels(2, 5, 5, 10), "lhs between traces");
        ExpectColor.transparentBlack(testRendererHarness.readPixels(12, 5, 5, 10), "rhs between traces");
        ExpectColor.red(testRendererHarness.readPixels(10, 5), "first y trace");
        ExpectColor.red(testRendererHarness.readPixels(19, 5), "last y trace");
        ExpectColor.red(testRendererHarness.readPixels(5, 1), "x trace lhs");
        ExpectColor.red(testRendererHarness.readPixels(15, 1), "x trace rhs");
    });

    function draw(updateArg: ICartesian2dUpdateArg<Float32Array>)
    {
        const gc = new GlCartesian2dTraceGraphicsComponent(new GlCartesian2dTraceBinder(), new GlCartesian2dCameraBinder());
        const testEntity: TGlTraceEntity = new ChartDataEntity(
            traceConnector,
            {
                traceColor: RgbaColorPacker.packColor(255, 0, 0, 255),
                traceLinePixelSize: 5,
                zIndexAbs: 0,
                traces: new Float32Array(40),
            },
            changeIdFactory,
        );
        populateCartesian2dTraceBindings(testEntity);

        updateTestGc(testRendererHarness, gc, testEntity, updateArg);
    }
});