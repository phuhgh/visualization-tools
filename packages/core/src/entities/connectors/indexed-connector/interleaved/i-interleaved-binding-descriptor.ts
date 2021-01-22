/**
 * @public
 */
export interface IInterleavedBindingDescriptor<TOffsets>
{
    offsets: TOffsets;
    blockElementCount: number;
    blockByteSize: number;
    byteOffset: number;
}