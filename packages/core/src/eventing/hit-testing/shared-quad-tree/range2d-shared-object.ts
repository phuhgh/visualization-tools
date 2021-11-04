import { IEmscriptenWrapper, IMemoryUtilBindings, IRawVoidPointer, IReadonlyRange2d, IReferenceCountedPtr, ISharedObject, isLittleEndian, RawVoidPointer, TTypedArray } from "rc-js-util";

export interface IRange2dSharedObject<TArray extends TTypedArray>
    extends ISharedObject
{
    readonly byteSize: number;
    update(range: IReadonlyRange2d<TArray>): void;
}

export class Range2dSharedObject<TArray extends TTypedArray>
    implements IRange2dSharedObject<TArray>
{
    public static createOneF32(wrapper: IEmscriptenWrapper<IMemoryUtilBindings>): IRange2dSharedObject<Float32Array>
    {
        return new Range2dSharedObject(wrapper, Float32Array.BYTES_PER_ELEMENT * 4);
    }

    public static createOneF64(wrapper: IEmscriptenWrapper<IMemoryUtilBindings>): IRange2dSharedObject<Float64Array>
    {
        return new Range2dSharedObject(wrapper, Float64Array.BYTES_PER_ELEMENT * 4);
    }

    public readonly sharedObject: IReferenceCountedPtr;
    public readonly byteSize: number;

    public update(range: IReadonlyRange2d<TArray>): void
    {
        range.copyToBuffer(this.rvp.getDataView(), 0, Range2dSharedObject.littleEndian);
    }

    protected constructor
    (
        wrapper: IEmscriptenWrapper<IMemoryUtilBindings>,
        size: number,
    )
    {
        this.byteSize = size;
        this.rvp = RawVoidPointer.createOne(wrapper, size, true);
        this.sharedObject = this.rvp.sharedObject;
    }

    private readonly rvp: IRawVoidPointer;
    private static littleEndian = isLittleEndian;
}