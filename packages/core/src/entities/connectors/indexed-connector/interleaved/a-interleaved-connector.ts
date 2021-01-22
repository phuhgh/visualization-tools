import { IInterleavedConnector } from "./i-interleaved-connector";
import { TTypedArray, TTypedArrayCtor } from "rc-js-util";
import { IInterleavedBindingDescriptor } from "./i-interleaved-binding-descriptor";

/**
 * @public
 * Construction options of {@link AInterleavedConnector}.
 */
export interface IInterleavedConfig<TOffsets>
{
    offsets: TOffsets;
    blockElementCount: number;
    /**
     * The interleaved index (as opposed to the data offset, which would be index * blockSize).
     */
    startIndex?: number;
    /**
     * The interleaved length (as opposed to the data length, which would be length * blockSize).
     */
    length?: number;
}

/**
 * @public
 * {@inheritDoc IInterleavedConnector}
 */
export abstract class AInterleavedConnector<TArray extends TTypedArray, TOffsets>
    implements IInterleavedConnector<TArray, TOffsets>
{
    public readonly offsets: TOffsets;

    public abstract getData(): TArray;

    public static getDescriptor<TOffsets>
    (
        config: IInterleavedConfig<TOffsets>,
        storageType: TTypedArrayCtor,
    )
        : IInterleavedBindingDescriptor<TOffsets>
    {
        return {
            offsets: config.offsets,
            byteOffset: (config.startIndex ?? 0) * config.blockElementCount * storageType.BYTES_PER_ELEMENT,
            blockElementCount: config.blockElementCount,
            blockByteSize: config.blockElementCount * storageType.BYTES_PER_ELEMENT,
        };
    }

    public getDescriptor(): IInterleavedBindingDescriptor<TOffsets>
    {
        return {
            offsets: this.offsets,
            byteOffset: this.getStart() * this.getBlockByteSize(),
            blockElementCount: this.getBlockElementCount(),
            blockByteSize: this.getBlockByteSize(),
        };
    }

    public getValue(index: number, offset: number): number
    {
        return this.getData()[index * this.blockElementCount + offset];
    }

    public setValue(index: number, offset: number, value: number): void
    {
        this.getData()[index * this.blockElementCount + offset] = value;
    }

    public getStart(): number
    {
        return this.startIndex;
    }

    public setStart(index: number): void
    {
        this.startIndex = index;
    }

    public getLength(): number
    {
        return this.length;
    }

    public setLength(length: number): void
    {
        this.length = length;
    }

    public getMaximumLength(): number
    {
        return this.getData().length / this.blockElementCount;
    }

    public getBlockElementCount(): number
    {
        return this.blockElementCount;
    }

    public getBlockByteSize(): number
    {
        return this.blockByteSize;
    }

    public getInterleavedBuffer(): TArray
    {
        return this.getData();
    }

    public getEnd(): number
    {
        return this.getStart() + this.getLength();
    }

    public getLoggableValue(): number[][]
    {
        const buffer = this.getData();
        const getBlockElementCount = this.getBlockElementCount();
        const result: number[][] = new Array(buffer.length / getBlockElementCount);

        for (let i = 0, iEnd = result.length; i < iEnd; ++i)
        {
            const block = result[i] = new Array<number>(getBlockElementCount);

            for (let j = 0; j < getBlockElementCount; ++j)
            {
                block[j] = buffer[i * getBlockElementCount + j];
            }
        }

        return result;
    }

    protected constructor
    (
        config: IInterleavedConfig<TOffsets>,
        initialDataLength: number,
        bytesPerElement: number,
    )
    {
        this.offsets = config.offsets;
        this.blockElementCount = config.blockElementCount;
        this.startIndex = this.getInitialStartIndex(config);
        this.length = this.getInitialLength(config, initialDataLength, this.startIndex);
        this.blockByteSize = bytesPerElement * this.blockElementCount;
    }

    private getInitialStartIndex(config: IInterleavedConfig<TOffsets>): number
    {
        return config.startIndex == null
            ? 0
            : config.startIndex;
    }

    private getInitialLength(config: IInterleavedConfig<TOffsets>, initialDataLength: number, start: number): number
    {
        return config.length == null
            ? ((initialDataLength - start * this.blockElementCount) / this.blockElementCount) | 0
            : config.length;
    }

    private readonly blockElementCount: number;
    private readonly blockByteSize: number;
    private startIndex: number;
    private length: number;
}