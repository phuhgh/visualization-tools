import { _Debug, IEmscriptenWrapper, IMemoryUtilBindings, IReferenceCountedPtr, ISharedArray, ISharedArrayBindings, ISharedObject, isLittleEndian, RawVoidPointer, ReferenceCountedPtr, SharedArray, TF32SharedArray, TF64SharedArray, TProperty, TTypedArray, TTypedArrayCtor } from "rc-js-util";
import { IInterleavedConnector } from "./i-interleaved-connector";
import { AInterleavedConnector, IInterleavedConfig } from "./a-interleaved-connector";

/**
 * @public
 */
export type TSharedInterleavedConnectorPrefix =
    | "f32InterleavedConnector"
    | "f64InterleavedConnector"
    ;

/**
 * @public
 */
export interface ISharedInterleavedConnectorBindings
    extends TProperty<`_${TSharedInterleavedConnectorPrefix}_createOne`, (argPtr: number) => number>,
            TProperty<`_${TSharedInterleavedConnectorPrefix}_delete`, (pointer: number) => void>,
            TProperty<`_${TSharedInterleavedConnectorPrefix}_setStart`, (pointer: number, start: number) => void>,
            TProperty<`_${TSharedInterleavedConnectorPrefix}_setLength`, (pointer: number, length: number) => void>,
            IMemoryUtilBindings
{
}

/**
 * @public
 * Provides a structured view into a `SharedArray`. Will take a claim on the `SharedArray` and release it when the object is disposed of.
 */
export interface ISharedInterleavedConnector<TArray extends TTypedArray, TOffsets>
    extends IInterleavedConnector<TArray, TOffsets>,
            ISharedObject
{
}

/**
 * @public
 * {@inheritDoc ISharedInterleavedConnector}
 */
export class SharedInterleavedConnector<TCtor extends TTypedArrayCtor, TOffsets>
    extends AInterleavedConnector<InstanceType<TCtor>, TOffsets>
    implements ISharedInterleavedConnector<InstanceType<TCtor>, TOffsets>
{
    public static createOneExistingF32SharedArray<TOffsets>
    (
        wrapper: IEmscriptenWrapper<ISharedInterleavedConnectorBindings>,
        sharedArray: TF32SharedArray,
        config: IInterleavedConfig<TOffsets>,
        owning: boolean,
    )
        : SharedInterleavedConnector<Float32ArrayConstructor, TOffsets>
    {
        const connector = new SharedInterleavedConnector("f32InterleavedConnector", wrapper, sharedArray, config);

        if (owning)
        {
            sharedArray.sharedObject.release();
        }

        return connector;
    }

    public static createOneF32<TOffsets>
    (
        wrapper: IEmscriptenWrapper<ISharedInterleavedConnectorBindings & ISharedArrayBindings>,
        size: number,
        config: IInterleavedConfig<TOffsets>,
    )
        : SharedInterleavedConnector<Float32ArrayConstructor, TOffsets>
    {
        const sharedArray = SharedArray.createOneF32(wrapper, size, true);
        SharedInterleavedConnector.createOneExistingF32SharedArray(wrapper, sharedArray, config, true);

        return new SharedInterleavedConnector("f32InterleavedConnector", wrapper, sharedArray, config);
    }

    public static createOneExistingF64SharedArray<TOffsets>
    (
        wrapper: IEmscriptenWrapper<ISharedInterleavedConnectorBindings>,
        sharedArray: TF64SharedArray,
        config: IInterleavedConfig<TOffsets>,
        owning: boolean,
    )
        : SharedInterleavedConnector<Float64ArrayConstructor, TOffsets>
    {
        const connector = new SharedInterleavedConnector("f64InterleavedConnector", wrapper, sharedArray, config);

        if (owning)
        {
            sharedArray.sharedObject.release();
        }

        return connector;
    }

    public static createOneF64<TOffsets>
    (
        wrapper: IEmscriptenWrapper<ISharedInterleavedConnectorBindings & ISharedArrayBindings>,
        size: number,
        config: IInterleavedConfig<TOffsets>,
    )
        : SharedInterleavedConnector<Float64ArrayConstructor, TOffsets>
    {
        const sharedArray = SharedArray.createOneF64(wrapper, size, true);
        SharedInterleavedConnector.createOneExistingF64SharedArray(wrapper, sharedArray, config, true);

        return new SharedInterleavedConnector("f64InterleavedConnector", wrapper, sharedArray, config);
    }

    public getInterleavedBuffer(): InstanceType<TCtor>
    {
        return this.sharedArray.getInstance();
    }

    public readonly sharedArray: ISharedArray<TCtor>;
    public readonly sharedObject: IReferenceCountedPtr;

    public getData(): InstanceType<TCtor>
    {
        return this.sharedArray.getInstance();
    }

    public setStart(index: number): void
    {
        DEBUG_MODE && _Debug.assert(!this.sharedObject.getIsDestroyed(), "attempted modification of destroyed object");
        super.setStart(index);
        this.wrapper.instance[this.cSetStart](this.sharedObject.getPtr(), index);
    }

    public setLength(length: number): void
    {
        DEBUG_MODE && _Debug.assert(!this.sharedObject.getIsDestroyed(), "attempted modification of destroyed object");
        super.setLength(length);
        this.wrapper.instance[this.cSetLength](this.sharedObject.getPtr(), length);
    }

    protected constructor
    (
        prefix: TSharedInterleavedConnectorPrefix,
        wrapper: IEmscriptenWrapper<ISharedInterleavedConnectorBindings>,
        sharedArray: ISharedArray<TCtor>,
        config: IInterleavedConfig<TOffsets>,
    )
    {
        super(config, sharedArray.length, sharedArray.elementByteSize);
        this.cSetStart = `_${prefix}_setStart`;
        this.cSetLength = `_${prefix}_setLength`;
        this.wrapper = wrapper;
        this.sharedArray = sharedArray;
        const pointer = this.initialize(prefix, wrapper, sharedArray.sharedObject.getPtr());
        this.sharedObject = new ReferenceCountedPtr(false, pointer);
        this.sharedObject.registerOnFreeListener(() => this.wrapper.instance._f32InterleavedConnector_delete(this.sharedObject.getPtr()));
        this.sharedObject.bindLifecycle(this.sharedArray.sharedObject);
    }

    private initialize
    (
        prefix: TSharedInterleavedConnectorPrefix,
        wrapper: IEmscriptenWrapper<ISharedInterleavedConnectorBindings>,
        sharedArrayPtr: number,
    )
        : number
    {
        const ctorArg = new SharedInterleavedConnectorArg(wrapper, this, sharedArrayPtr);
        const ptr = wrapper.instance[`_${prefix}_createOne`](ctorArg.sharedObject.getPtr());
        ctorArg.sharedObject.release();
        DEBUG_MODE && _Debug.assert(ctorArg.sharedObject.getIsDestroyed(), "expected arg to be destroyed after initialization");
        return ptr;
    }

    private readonly wrapper: IEmscriptenWrapper<ISharedInterleavedConnectorBindings>;
    private readonly cSetStart: `_${TSharedInterleavedConnectorPrefix}_setStart`;
    private readonly cSetLength: `_${TSharedInterleavedConnectorPrefix}_setLength`;
}

class SharedInterleavedConnectorArg<TArray extends TTypedArray>
    implements ISharedObject
{
    public sharedObject: IReferenceCountedPtr;

    public constructor
    (
        wrapper: IEmscriptenWrapper<IMemoryUtilBindings>,
        connector: ISharedInterleavedConnector<TArray, unknown>,
        sharedArrayPtr: number,
    )
    {
        this.rvp = RawVoidPointer.createOne(wrapper, Uint32Array.BYTES_PER_ELEMENT * 5, true);
        this.sharedObject = this.rvp.sharedObject;

        const dataView = this.rvp.getDataView();
        dataView.setUint32(0, sharedArrayPtr, SharedInterleavedConnectorArg.littleEndian);
        dataView.setUint32(Uint32Array.BYTES_PER_ELEMENT, connector.getStart(), SharedInterleavedConnectorArg.littleEndian);
        dataView.setUint32(Uint32Array.BYTES_PER_ELEMENT * 2, connector.getLength(), SharedInterleavedConnectorArg.littleEndian);
        dataView.setUint32(Uint32Array.BYTES_PER_ELEMENT * 3, connector.getMaximumLength(), SharedInterleavedConnectorArg.littleEndian);
        dataView.setUint32(Uint32Array.BYTES_PER_ELEMENT * 4, connector.getBlockElementCount(), SharedInterleavedConnectorArg.littleEndian);
    }

    private readonly rvp: RawVoidPointer;
    private static readonly littleEndian = isLittleEndian;
}
