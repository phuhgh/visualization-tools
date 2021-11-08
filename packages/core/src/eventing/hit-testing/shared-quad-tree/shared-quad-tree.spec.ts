import { testModuleExtension } from "../../../test-utils/test-module-extension";
import { Emscripten, Range2d, Vec2 } from "rc-js-util";
import { IVisualizationToolBindings } from "../../../i-visualization-tool-bindings";
import { emscriptenAsanTestModuleOptions, SanitizedEmscriptenTestModule } from "rc-js-util/bin/src/web-assembly/emscripten/sanitized-emscripten-test-module";
import { setDefaultUnitTestFlags } from "rc-js-util/bin/src/debug/impl/set-default-unit-test-flags";
import { SharedQuadTree } from "./shared-quad-tree";
import { debugDescribe } from "rc-js-test-util";

declare const require: (path: string) => Emscripten.EmscriptenModuleFactory<IVisualizationToolBindings>;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const testModule = require("asan-test-module");

debugDescribe("=> SharedQuadTree", () =>
{
    const emscriptenTestModule = new SanitizedEmscriptenTestModule(testModule, emscriptenAsanTestModuleOptions, testModuleExtension);

    beforeAll(async () =>
    {
        setDefaultUnitTestFlags();
        await emscriptenTestModule.initialize();
    });

    afterAll(() =>
    {
        emscriptenTestModule.endEmscriptenProgram();
    });

    it("| constructs without trigger the asan", () =>
    {
        const tree = SharedQuadTree.createOneF32(emscriptenTestModule.wrapper, 4, 1);
        tree.sharedObject.release();
    });

    it("| sets options without triggering the asan", () =>
    {
        const tree = SharedQuadTree.createOneF32(emscriptenTestModule.wrapper, 4, 1);
        tree.setOptions(10, 4);
        tree.sharedObject.release();
    });

    it("| sets top level without triggering the asan", () =>
    {
        const tree = SharedQuadTree.createOneF32(emscriptenTestModule.wrapper, 4, 1);
        tree.setTopLevel(Range2d.f32.factory.createOne(0, 1, 0, 1));
        tree.sharedObject.release();
    });

    it("| queries point without triggering the asan", () =>
    {
        const tree = SharedQuadTree.createOneF32(emscriptenTestModule.wrapper, 4, 1);
        tree.setTopLevel(Range2d.f32.factory.createOne(0, 1, 0, 1));
        tree.queryPoint(Vec2.f32.factory.createOne(1, 1), 0xF);
        tree.sharedObject.release();
    });

    it("| inserts ranges without triggering the asan", () =>
    {
        const tree = SharedQuadTree.createOneF32(emscriptenTestModule.wrapper, 4, 1);
        tree.setTopLevel(Range2d.f32.factory.createOne(0, 2, 0, 2));
        tree.addBoundingBox(Range2d.f32.factory.createOne(0, 1, 0, 1), 1, 1, 0xF);
        tree.sharedObject.release();
    });

    it("| clears without triggering the asan", () =>
    {
        const tree = SharedQuadTree.createOneF32(emscriptenTestModule.wrapper, 4, 1);
        tree.setTopLevel(Range2d.f32.factory.createOne(0, 2, 0, 2));
        tree.addBoundingBox(Range2d.f32.factory.createOne(0, 1, 0, 1), 1, 1, 0xF);
        tree.addBoundingBox(Range2d.f32.factory.createOne(0, 1, 0, 1), 1, 1, 0xF);
        tree.addBoundingBox(Range2d.f32.factory.createOne(0, 1, 0, 1), 1, 1, 0xF);
        tree.setTopLevel(Range2d.f32.factory.createOne(0, 1, 0, 1));
        tree.sharedObject.release();
    });

    it("| returns the expected results", () =>
    {
        const tree = SharedQuadTree.createOneF32(emscriptenTestModule.wrapper, 4, 1);
        tree.setTopLevel(Range2d.f32.factory.createOne(0, 2, 0, 2));

        tree.addBoundingBox(Range2d.f32.factory.createOne(-1, 0, 0, 1), 1, 1, 1);
        tree.addBoundingBox(Range2d.f32.factory.createOne(0, 1, 0, 1), 1, 1, 1);
        tree.addBoundingBox(Range2d.f32.factory.createOne(0, 0.5, 0, 0.5), 1, 2, 1);
        tree.addBoundingBox(Range2d.f32.factory.createOne(0, 0.5, 0.25, 0.5), 1, 3, 1);
        tree.addBoundingBox(Range2d.f32.factory.createOne(0, 0.5, 0.25, 0.5), 2, 0, 2);

        expect(tree.getQuadElementCount()).toBe(5);

        expect(tree.queryPoint(Vec2.f32.factory.createOne(0.25, 0.25), 1)).toBe(3);
        expect(tree.getResults().subarray(0, 9)).toEqual(new Uint32Array([
            1, 1, 1,
            1, 2, 1,
            1, 3, 1,
        ]));

        expect(tree.queryPoint(Vec2.f32.factory.createOne(0.75, 0.75), 1)).toBe(2);
        expect(tree.getResults().subarray(0, 6)).toEqual(new Uint32Array([
            1, 1, 1,
            1, 2, 1,
        ]));

        expect(tree.queryPoint(Vec2.f32.factory.createOne(1.5, 1.5), 1)).toBe(1);
        expect(tree.getResults().subarray(0, 3)).toEqual(new Uint32Array([
            1, 1, 1,
        ]));

        expect(tree.queryPoint(Vec2.f32.factory.createOne(0.25, 0.375), 2)).toBe(1);
        expect(tree.getResults().subarray(0, 3)).toEqual(new Uint32Array([
            2, 0, 2,
        ]));

        tree.sharedObject.release();
    });

    it("| handles deep nesting", () =>
    {
        const tree = SharedQuadTree.createOneF32(emscriptenTestModule.wrapper, 13, 1);
        tree.setTopLevel(Range2d.f32.factory.createOne(0, 1, 0, 1));

        for (let i = 0, iEnd = 16; i < iEnd; ++i)
        {
            tree.addBoundingBox(Range2d.f32.factory.createOne(0, 0.03125, 0.0, 0.03125), 1, i, 1);
        }

        expect(tree.queryPoint(Vec2.f32.factory.createOne(0.03125 / 2, 0.03125 / 2), 1)).toBe(13);

        tree.sharedObject.release();
    });
});