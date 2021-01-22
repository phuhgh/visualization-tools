import { IEmscriptenWrapper, IMemoryUtilBindings, IRawVoidPointer, IReferenceCountedPtr, ISharedObject, isLittleEndian, RawVoidPointer } from "rc-js-util";

export interface IQuadElementSharedObject
    extends ISharedObject
{
    update
    (
        entityId: number,
        dataId: number,
        filterMask: number,
    )
        : void;
}

export class QuadElementSharedObject
    implements IQuadElementSharedObject
{
    public static elementCount: number = 3;
    public static byteSize: number = Uint32Array.BYTES_PER_ELEMENT * QuadElementSharedObject.elementCount;
    public readonly sharedObject: IReferenceCountedPtr;

    public update
    (
        entityId: number,
        dataId: number,
        filterMask: number,
    )
        : void
    {
        const dataView = this.rvp.getDataView();
        dataView.setUint32(0, entityId, QuadElementSharedObject.littleEndian);
        dataView.setUint32(Uint32Array.BYTES_PER_ELEMENT, dataId, QuadElementSharedObject.littleEndian);
        dataView.setUint32(Uint32Array.BYTES_PER_ELEMENT * 2, filterMask, QuadElementSharedObject.littleEndian);
    }

    public constructor
    (
        wrapper: IEmscriptenWrapper<IMemoryUtilBindings>,
    )
    {
        this.rvp = RawVoidPointer.createOne(wrapper, QuadElementSharedObject.byteSize, true);
        this.sharedObject = this.rvp.sharedObject;
    }

    private readonly rvp: IRawVoidPointer;
    private static littleEndian = isLittleEndian;
}