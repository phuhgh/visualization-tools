import { Emscripten, IncrementingIdentifierFactory, Mat3, Range1d, Range2d, SharedArray, TF32SharedArray, Vec2 } from "rc-js-util";
import { emscriptenAsanTestModuleOptions, SanitizedEmscriptenTestModule } from "rc-js-util/bin/src/web-assembly/emscripten/sanitized-emscripten-test-module";
import { debugDescribe } from "rc-js-test-util";
import { ChartDataEntity, IHitTestableTrait, SharedEntityQuadTree, SharedInterleavedConnector } from "@visualization-tools/core";
import { testModuleExtension } from "@visualization-tools/core/bin/test-utils/test-module-extension";
import { ICartesian2dBindings } from "../../../i-cartesian-2d-bindings";
import { TSharedInterleavedPoint2dTrait } from "../../../traits/t-shared-interleaved-point2d-trait";
import { IDrawablePoint2dOffsets } from "../../../series/i-drawable-point2d-offsets";
import { Point2dDisplaySettings } from "../../../traits/t-point2d-display-settings-trait";
import { Point2dSizeNormalizer } from "../../../traits/t-point2d-size-normalizer-trait";
import { SharedInterleavedCircle2dQuadIndexerFactory } from "./shared-interleaved-circle-2d-quad-indexer-factory";
import { ISharedInterleavedPoint2dQuadIndexer } from "./shared-interleaved-point-2d-quad-indexer";
import { Cartesian2dIdentityTransform } from "../../../update/user-transforms/cartesian2d-identity-transform";

declare const require: (path: string) => Emscripten.EmscriptenModuleFactory<ICartesian2dBindings>;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const testModule = require("asan-test-module");

debugDescribe("=> SharedInterleavedCircle2dQuadIndexerFactory", () =>
{
    const emscriptenTestModule = new SanitizedEmscriptenTestModule(testModule, emscriptenAsanTestModuleOptions, testModuleExtension);
    const changeIdFactory = new IncrementingIdentifierFactory();
    let tree: SharedEntityQuadTree<unknown, IHitTestableTrait>;
    let indexer: ISharedInterleavedPoint2dQuadIndexer<Float32Array>;
    let sharedArray: TF32SharedArray;
    let connector: SharedInterleavedConnector<Float32ArrayConstructor, IDrawablePoint2dOffsets>;
    let entity: IHitTestableTrait & TSharedInterleavedPoint2dTrait<Float32Array, IDrawablePoint2dOffsets>;
    const identityTransform = new Cartesian2dIdentityTransform<Float32Array>();

    beforeAll(async () =>
    {
        await emscriptenTestModule.initialize();
    });

    afterAll(() =>
    {
        emscriptenTestModule.endEmscriptenProgram();
    });

    beforeEach(() =>
    {
        tree = new SharedEntityQuadTree(emscriptenTestModule.wrapper, 4, 1);
        indexer = SharedInterleavedCircle2dQuadIndexerFactory.createOneF32(emscriptenTestModule.wrapper);
        sharedArray = SharedArray.createOneF32(emscriptenTestModule.wrapper, 9);
        connector = SharedInterleavedConnector.createOneExistingF32SharedArray(
            emscriptenTestModule.wrapper,
            sharedArray,
            { blockElementCount: 3, offsets: { x: 0, y: 1 } },
            true,
        );
        entity = new ChartDataEntity(
            connector,
            {
                pointDisplay: new Point2dDisplaySettings(1, 0),
                pointSizeNormalizer: new Point2dSizeNormalizer(Range1d.f32.factory.createOne(1, 2)),
                zIndexAbs: 0,
                zIndexRel: 0,
            },
            changeIdFactory,
        );
        entity.groupMask = 1;
        entity.hitTestId = 2;
    });

    afterEach(() =>
    {
        indexer.sharedObject.release();
        tree.sharedObject.release();
        sharedArray.sharedObject.release();
        connector.sharedObject.release();
    });

    describe("=> with point sizes", () =>
    {
        it("| adds the expected quad elements", () =>
        {
            sharedArray.getInstance().set([
                2, 2, 1,
                4, 1, 2,
                0, 4, 1,
            ]);
            entity.data.offsets.size = 2;
            entity.graphicsSettings.pointSizeNormalizer.extendDataRange(1, 2);
            tree.sharedTree.setTopLevel(Range2d.f32.factory.createOne(0, 4, 0, 4));

            indexer.addToTree(tree, entity, Mat3.f32.factory.createOneEmpty().setIdentityMatrix(), identityTransform);

            expect(tree.sharedTree.getQuadElementCount())
                .withContext("total count")
                .toBe(4); // the middle circle spans two quads

            expect(tree.sharedTree.queryPoint(Vec2.f32.factory.createOne(1, 3), 1))
                .withContext("top left quad")
                .toBe(2);

            expect(tree.sharedTree.queryPoint(Vec2.f32.factory.createOne(1, 1), 1))
                .withContext("bottom left quad")
                .toBe(1);
            expect(tree.sharedTree.getResults().subarray(0, 3)).toEqual(new Uint32Array([2, 0, 1]));

            expect(tree.sharedTree.queryPoint(Vec2.f32.factory.createOne(3, 1), 1))
                .withContext("top right quad")
                .toBe(2);

            expect(tree.sharedTree.queryPoint(Vec2.f32.factory.createOne(3, 1), 1))
                .withContext("bottom right quad")
                .toBe(2);
        });
    });

    describe("=> without point sizes", () =>
    {
        it("| adds the expected quad elements", () =>
        {
            sharedArray.getInstance().set([
                2, 2, 0,
                4, 4, 0,
                0, 2, 0,
            ]);
            tree.sharedTree.setTopLevel(Range2d.f32.factory.createOne(0, 4, 0, 4));

            indexer.addToTree(tree, entity, Mat3.f32.factory.createOneEmpty().setIdentityMatrix(), identityTransform);

            expect(tree.sharedTree.getQuadElementCount())
                .withContext("total count")
                .toBe(4); // the last circle spans two quads

            expect(tree.sharedTree.queryPoint(Vec2.f32.factory.createOne(3, 3), 1))
                .withContext("top right quad")
                .toBe(2);

            expect(tree.sharedTree.queryPoint(Vec2.f32.factory.createOne(3, 1), 1))
                .withContext("bottom right quad")
                .toBe(1);

            expect(tree.sharedTree.getResults().subarray(0, 3)).toEqual(new Uint32Array([2, 0, 1]));

            expect(tree.sharedTree.queryPoint(Vec2.f32.factory.createOne(1, 3), 1))
                .withContext("top left quad")
                .toBe(2);

            expect(tree.sharedTree.queryPoint(Vec2.f32.factory.createOne(1, 1), 1))
                .withContext("bottom left quad")
                .toBe(2);
        });
    });
});