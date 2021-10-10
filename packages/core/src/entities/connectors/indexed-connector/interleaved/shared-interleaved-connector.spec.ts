import { emscriptenAsanTestModuleOptions, SanitizedEmscriptenTestModule } from "rc-js-util/bin/src/web-assembly/emscripten/sanitized-emscripten-test-module";
import { SharedInterleavedConnector } from "./shared-interleaved-connector";
import { Emscripten, SharedArray, TF32SharedArray } from "rc-js-util";
import { IVisualizationToolBindings } from "../../../../i-visualization-tool-bindings";
import { testModuleExtension } from "../../../../test-utils/test-module-extension";
import { debugDescribe } from "rc-js-test-util";
import { ITestPointOffsets } from "../../../../test-utils/fakes/i-test-point-offsets";

declare const require: (path: string) => Emscripten.EmscriptenModuleFactory<IVisualizationToolBindings>;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const testModule = require("asan-test-module");

debugDescribe("=> SharedInterleavedConnector", () =>
{
    let connector: SharedInterleavedConnector<Float32ArrayConstructor, ITestPointOffsets>;
    let sharedArray: TF32SharedArray;

    const emscriptenTestModule = new SanitizedEmscriptenTestModule(testModule, emscriptenAsanTestModuleOptions, testModuleExtension);

    beforeAll(async () =>
    {
        await emscriptenTestModule.initialize();
    });

    beforeEach(() =>
    {
        sharedArray = SharedArray.createOneF32(emscriptenTestModule.wrapper, 6);
        const a = sharedArray.getInstance();
        a.set([1, 2, 3, 4, 5, 6]);
    });

    afterEach(() =>
    {
        if (connector != null)
        {
            connector.sharedObject.release();
        }
    });

    afterAll(() =>
    {
        emscriptenTestModule.endEmscriptenProgram();
    });

    it("| sanity checks", () =>
    {
        const a = sharedArray.getInstance();
        expect(a[0]).toEqual(1);
        expect(a[1]).toEqual(2);
        expect(a[2]).toEqual(3);
        expect(a[3]).toEqual(4);
        expect(a[4]).toEqual(5);
        expect(a[5]).toEqual(6);
        sharedArray.sharedObject.release();
    });

    describe("=> where block size isn't a multiple", () =>
    {
        it("| floors the length", () =>
        {
            sharedArray.sharedObject.release();
            sharedArray = SharedArray.createOneF32(emscriptenTestModule.wrapper, 5);
            const a = sharedArray.getInstance();
            a.set([1, 2, 3, 4, 5]);
            connector = SharedInterleavedConnector.createOneExistingF32SharedArray(
                emscriptenTestModule.wrapper,
                sharedArray,
                { offsets: { x: 0, y: 1 }, startIndex: 1, blockElementCount: 2 },
                true,
            );
            expect(connector.getLength()).toBe(1);
        });
    });

    describe("=> getStartIndex", () =>
    {
        it("| returns the value set", () =>
        {
            connector = SharedInterleavedConnector.createOneExistingF32SharedArray(
                emscriptenTestModule.wrapper,
                sharedArray,
                { offsets: { x: 0, y: 1 }, startIndex: 1, blockElementCount: 2 },
                true,
            );
            expect(connector.getStart()).toBe(1);
        });

        it("| returns 0 if not set", () =>
        {
            connector = SharedInterleavedConnector.createOneExistingF32SharedArray(
                emscriptenTestModule.wrapper,
                sharedArray,
                { offsets: { x: 0, y: 1 }, blockElementCount: 2 },
                true,
            );
            expect(connector.getStart()).toBe(0);
        });
    });

    describe("=> setStartIndex", () =>
    {
        it("| sets the start index", () =>
        {
            connector = SharedInterleavedConnector.createOneExistingF32SharedArray(
                emscriptenTestModule.wrapper,
                sharedArray,
                { offsets: { x: 0, y: 1 }, startIndex: 1, blockElementCount: 2 },
                true,
            );
            connector.setStart(2);
            expect(connector.getStart()).toBe(2);
        });
    });

    describe("=> getLength", () =>
    {
        it("| returns the value set", () =>
        {
            connector = SharedInterleavedConnector.createOneExistingF32SharedArray(
                emscriptenTestModule.wrapper,
                sharedArray,
                { offsets: { x: 0, y: 1 }, startIndex: 1, blockElementCount: 2, length: 2 },
                true,
            );
            expect(connector.getLength()).toBe(2);
        });

        it("returns the remaining length where not set", () =>
        {
            connector = SharedInterleavedConnector.createOneExistingF32SharedArray(
                emscriptenTestModule.wrapper,
                sharedArray,
                { offsets: { x: 0, y: 1 }, startIndex: 2, blockElementCount: 2 },
                true,
            );
            expect(connector.getLength()).toBe(1);
        });
    });

    describe("=> setLength", () =>
    {
        it("| returns the value set", () =>
        {
            connector = SharedInterleavedConnector.createOneExistingF32SharedArray(
                emscriptenTestModule.wrapper,
                sharedArray,
                { offsets: { x: 0, y: 1 }, startIndex: 1, blockElementCount: 2, length: 2 },
                true,
            );
            connector.setLength(3);
            expect(connector.getLength()).toBe(3);
        });
    });

    describe("=> getEnd", () =>
    {
        it("| returns startIndex + length", () =>
        {
            connector = SharedInterleavedConnector.createOneExistingF32SharedArray(
                emscriptenTestModule.wrapper,
                sharedArray,
                { offsets: { x: 0, y: 1 }, startIndex: 1, blockElementCount: 2, length: 2 },
                true,
            );
            expect(connector.getEnd()).toBe(3);
        });
    });

    describe("=> getValue", () =>
    {
        it("| returns the expected values", () =>
        {
            connector = SharedInterleavedConnector.createOneExistingF32SharedArray(
                emscriptenTestModule.wrapper,
                sharedArray,
                { offsets: { x: 0, y: 1 }, startIndex: 1, blockElementCount: 2, length: 2 },
                true,
            );
            expect(connector.getLength()).toBe(2);

            for (let i = connector.getStart(), iEnd = connector.getEnd(); i < iEnd; ++i)
            {
                expect(connector.getValue(i, 0)).toBe(sharedArray.getInstance()[i * 2]);
            }

            for (let i = connector.getStart(), iEnd = connector.getEnd(); i < iEnd; ++i)
            {
                expect(connector.getValue(i, 1)).toBe(sharedArray.getInstance()[i * 2 + 1]);
            }
        });
    });

    describe("=> getMaximumLength", () =>
    {
        it("| returns dataSize / blockSize", () =>
        {
            connector = SharedInterleavedConnector.createOneExistingF32SharedArray(
                emscriptenTestModule.wrapper,
                sharedArray,
                { offsets: { x: 0, y: 1 }, startIndex: 0, blockElementCount: 2, length: 2 },
                true,
            );
            expect(connector.getMaximumLength()).toBe(3);
        });
    });

    describe("=> getBlockElementCount", () =>
    {
        it("| returns the provided values", () =>
        {
            connector = SharedInterleavedConnector.createOneExistingF32SharedArray(
                emscriptenTestModule.wrapper,
                sharedArray,
                { offsets: { x: 0, y: 1 }, startIndex: 0, blockElementCount: 2, length: 2 },
                true,
            );
            expect(connector.getBlockElementCount()).toBe(2);
        });
    });

    describe("=> getBlockByteSize", () =>
    {
        it("| returns the provided values", () =>
        {
            connector = SharedInterleavedConnector.createOneExistingF32SharedArray(
                emscriptenTestModule.wrapper,
                sharedArray,
                { offsets: { x: 0, y: 1 }, startIndex: 0, blockElementCount: 2, length: 2 },
                true,
            );
            expect(connector.getBlockByteSize()).toBe(2 * Float32Array.BYTES_PER_ELEMENT);
        });
    });
});