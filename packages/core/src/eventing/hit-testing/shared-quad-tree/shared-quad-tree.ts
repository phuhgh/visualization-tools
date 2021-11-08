import { _Debug, _Math, DebugProtectedView, DebugSharedObjectChecks, IEmscriptenWrapper, IMemoryUtilBindings, IReadonlyRange2d, IReadonlyVec2, IReferenceCountedPtr, ISharedObject, ReferenceCountedPtr, TF32Range2d, TListener, TTypedArray } from "rc-js-util";
import { IRange2dSharedObject, Range2dSharedObject } from "./range2d-shared-object";
import { IQuadElementSharedObject, QuadElementSharedObject } from "./quad-element-shared-object";

/**
 * @public
 * Emscripten quad tree.
 *
 * @remarks
 * Max results is restricted to 16384 results, good for a 4k screen with 4 elements per quad. For best performance insert
 * large bounding boxes first.
 */
export interface ISharedQuadTree<TArray extends TTypedArray>
    extends ISharedObject
{
    getResults(): Uint32Array;

    setTopLevel(range2d: IReadonlyRange2d<Float32Array>): void;
    setOptions(maxDepth: number, maxElementsPerNode: number): void;
    queryPoint(point: IReadonlyVec2<TArray>, filterMask: number): number;
    addBoundingBox
    (
        aabb: TF32Range2d,
        elementId: number,
        dataId: number,
        filterMask: number,
    )
        : void;
    getQuadElementCount(): number;
}

/**
 * @public
 */
export interface ISharedQuadTreeBindings
    extends IMemoryUtilBindings
{
    _f32QuadTree_createTree(maxDepth: number, maxElementsPerNode: number): number;
    _f32QuadTree_setTopLevel(treePtr: number, rangePtr: number): void;
    _f32QuadTree_queryPoint(treePtr: number, pointerX: number, pointerY: number, filterMask: number): number;
    _f32QuadTree_insertRange(treePtr: number, rangePtr: number, elementPtr: number): void;
    _f32QuadTree_delete(treePtr: number): void;
    _quadTree_getResultAddress(): number;
    _quadTree_getQuadElementCount(treePtr: number): number;
    _quadTree_setOptions(treePtr: number, maxDepth: number, maxElementsPerNode: number): number;
}

/**
 * @public
 * {@inheritDoc ISharedQuadTree}
 */
export class SharedQuadTree<TArray extends TTypedArray>
    implements ISharedQuadTree<TArray>,
               TListener<"onMemoryResize", []>
{
    public static createOneF32
    (
        wrapper: IEmscriptenWrapper<ISharedQuadTreeBindings>,
        maxDepth: number,
        maxElementsPerNode: number,
        maximumResultCount?: number,
    )
        : ISharedQuadTree<Float32Array>
    {
        return new SharedQuadTree<Float32Array>(wrapper, maxDepth, maxElementsPerNode, maximumResultCount);
    }

    public readonly sharedObject: IReferenceCountedPtr;

    public getResults(): Uint32Array
    {
        if (DEBUG_MODE)
        {
            return RcJsUtilDebug.protectedViews
                .getValue(this)
                .createProtectedView(this.results);
        }
        else
        {
            return this.results;
        }
    }

    public addBoundingBox
    (
        aabb: TF32Range2d,
        entityId: number,
        dataId: number,
        filterMask: number,
    )
        : void
    {
        this.sharedQuadElement.update(entityId, dataId, filterMask);
        this.sharedRange2d.update(aabb);
        this.wrapper.instance._f32QuadTree_insertRange(
            this.sharedObject.getPtr(),
            this.sharedRange2d.sharedObject.getPtr(),
            this.sharedQuadElement.sharedObject.getPtr(),
        );
    }

    public setTopLevel(range2d: IReadonlyRange2d<Float32Array>): void
    {
        this.sharedRange2d.update(range2d);
        this.wrapper.instance._f32QuadTree_setTopLevel(this.sharedObject.getPtr(), this.sharedRange2d.sharedObject.getPtr());
        this.isInitialized = true;
    }

    public setOptions(maxDepth: number, maxElementsPerNode: number): void
    {
        this.wrapper.instance._quadTree_setOptions(this.sharedObject.getPtr(), maxDepth, maxElementsPerNode);
    }

    public queryPoint(point: IReadonlyVec2<TArray>, filterMask: number): number
    {
        if (!this.isInitialized)
        {
            return 0;
        }

        return this.wrapper.instance._f32QuadTree_queryPoint(
            this.sharedObject.getPtr(),
            point.getX(),
            point.getY(),
            filterMask,
        );
    }

    public getQuadElementCount(): number
    {
        return this.wrapper.instance._quadTree_getQuadElementCount(this.sharedObject.getPtr());
    }

    public onMemoryResize = (): void =>
    {
        this.results = this.getResultArray();
    };

    protected constructor
    (
        private readonly wrapper: IEmscriptenWrapper<ISharedQuadTreeBindings>,
        maxDepth: number,
        maxElementsPerNode: number,
        private readonly maximumResultCount: number | undefined,
    )
    {
        const treePointer = wrapper.instance._f32QuadTree_createTree(maxDepth, maxElementsPerNode);
        this.sharedObject = new ReferenceCountedPtr(false, treePointer);
        this.sharedObject.registerOnFreeListener(this.wrapper.memoryResize.addTemporaryListener(this));
        this.sharedObject.registerOnFreeListener(() => this.wrapper.instance._f32QuadTree_delete(this.sharedObject.getPtr()));
        DEBUG_MODE && _Debug.runBlock(() =>
        {
            const protectedView = new DebugProtectedView<Float32Array>(["BYTES_PER_ELEMENT"], "Shared quad tree - memory resize danger, refresh instance with getResults");
            DebugSharedObjectChecks.registerWithCleanup(this, protectedView, "shared array");
        });

        this.sharedRange2d = Range2dSharedObject.createOneF32(wrapper);
        this.sharedObject.takeOwnership(this.sharedRange2d.sharedObject);

        this.sharedQuadElement = new QuadElementSharedObject(wrapper);
        this.sharedObject.takeOwnership(this.sharedQuadElement.sharedObject);

        this.maximumResultCount = SharedQuadTree.getResultCount(maximumResultCount);
        this.resultAddress = this.wrapper.instance._quadTree_getResultAddress();
        this.results = this.getResultArray();
    }

    private getResultArray(): Uint32Array
    {
        return new Uint32Array(this.wrapper.memory.buffer, this.resultAddress, this.maximumResultCount);
    }

    private static getResultCount(maximumResultCount: number | undefined): number
    {
        const theoreticalMax = 4096 * 4 * QuadElementSharedObject.byteSize;
        return _Math.min(maximumResultCount ?? theoreticalMax, theoreticalMax);
    }

    private readonly resultAddress: number;
    private readonly sharedQuadElement: IQuadElementSharedObject;
    private readonly sharedRange2d: IRange2dSharedObject<Float32Array>;
    private results: Uint32Array;
    private isInitialized = false;
}

