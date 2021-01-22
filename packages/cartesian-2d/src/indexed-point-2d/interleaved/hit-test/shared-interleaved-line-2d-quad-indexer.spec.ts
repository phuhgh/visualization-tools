import { Emscripten, IncrementingIdentifierFactory, Mat3, Range1d, Range2d, SharedArray, Vec2 } from "rc-js-util";
import { emscriptenAsanTestModuleOptions, SanitizedEmscriptenTestModule } from "rc-js-util/bin/src/web-assembly/emscripten/sanitized-emscripten-test-module";
import { SharedInterleavedLine2dQuadIndexerFactory } from "./shared-interleaved-line-2d-quad-indexer-factory";
import { debugDescribe } from "rc-js-test-util";
import { ChartDataEntity, IHitTestableTrait, SharedEntityQuadTree, SharedInterleavedConnector } from "@visualization-tools/core";
import { testModuleExtension } from "@visualization-tools/core/bin/test-utils/test-module-extension";
import { ICartesian2dBindings } from "../../../i-cartesian-2d-bindings";
import { TSharedInterleavedPoint2dTrait } from "../../../traits/t-shared-interleaved-point2d-trait";
import { IDrawablePoint2dOffsets } from "../../../series/i-drawable-point2d-offsets";
import { Point2dDisplaySettings } from "../../../traits/t-point2d-display-settings-trait";
import { Point2dSizeNormalizer } from "../../../traits/t-point2d-size-normalizer-trait";

declare const require: (path: string) => Emscripten.EmscriptenModuleFactory<ICartesian2dBindings>;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const testModule = require("asan-test-module");

debugDescribe("=> SharedInterleavedLine2dQuadIndexer", () =>
{
    const emscriptenTestModule = new SanitizedEmscriptenTestModule(testModule, emscriptenAsanTestModuleOptions, testModuleExtension);
    const changeIdFactory = new IncrementingIdentifierFactory();

    beforeAll(async () =>
    {
        await emscriptenTestModule.initialize();
    });

    afterAll(() =>
    {
        emscriptenTestModule.endEmscriptenProgram();
    });

    it("| adds the expected quad elements", () =>
    {
        const tree = new SharedEntityQuadTree(emscriptenTestModule.wrapper, 4, 1);
        const indexer = SharedInterleavedLine2dQuadIndexerFactory.createOneF32(emscriptenTestModule.wrapper);
        const sharedArray = SharedArray.createOneF32(emscriptenTestModule.wrapper, 6);
        sharedArray.getInstance().set([1, 1, 2, 2, 1.5, 0]);
        const connector = SharedInterleavedConnector.createOneExistingF32SharedArray(
            emscriptenTestModule.wrapper,
            sharedArray,
            { blockElementCount: 2, offsets: { x: 0, y: 1 } },
            true,
        );

        tree.sharedTree.setTopLevel(Range2d.f32.factory.createOne(0, 2, 0, 2));
        const entity: IHitTestableTrait & TSharedInterleavedPoint2dTrait<Float32Array, IDrawablePoint2dOffsets> = new ChartDataEntity(
            connector,
            {
                pointDisplay: new Point2dDisplaySettings(10, 0),
                pointSizeNormalizer: new Point2dSizeNormalizer(Range1d.f32.factory.createOne(0, 1)),
                zIndexAbs: 0,
                zIndexRel: 0,
            },
            changeIdFactory,
        );
        entity.groupMask = 1;
        entity.hitTestId = 2;

        indexer.update(tree, entity, Mat3.f32.factory.createOneEmpty().setIdentityMatrix());
        expect(tree.sharedTree.queryPoint(Vec2.f32.factory.createOne(0.5, 0.5), 1)).toBe(1, "bottom left quad");
        expect(tree.sharedTree.getResults().subarray(0, 3)).toEqual(new Uint32Array([2, 0, 1]));
        expect(tree.sharedTree.queryPoint(Vec2.f32.factory.createOne(1.5, 0.5), 1)).toBe(2, "bottom right quad");
        expect(tree.sharedTree.getQuadElementCount()).toBe(3, "total count"); // (the second line segment spans 2 quads)

        indexer.sharedObject.release();
        tree.sharedObject.release();
        sharedArray.sharedObject.release();
        connector.sharedObject.release();
    });
});