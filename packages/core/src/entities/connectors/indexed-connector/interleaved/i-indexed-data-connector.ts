/**
 * @public
 * Generic descriptor of indexable data, good for parallel or interleaved buffers. Makes the assumption that
 * each index has one or more associated values, accessed via `offsets`.
 */
export interface IIndexedDataConnector<TOffsets>
{
    offsets: TOffsets;

    /**
     * The maximum number of blocks that can be used. May not be adjusted after creation.
     */
    getMaximumLength(): number;
    /**
     * The number of elements in a block. May not be adjusted after creation.
     */
    getBlockElementCount(): number;

    getBlockByteSize(): number;

    getStart(): number;
    setStart(index: number): void;
    /**
     * The current length.
     */
    getLength(): number;
    setLength(length: number): void;

    /**
     * Start index + length. Useful for iteration.
     */
    getEnd(): number;

    getValue(index: number, offset: number): number;
    setValue(index: number, offset: number, value: number): void;

    getLoggableValue(): number[][];
}
