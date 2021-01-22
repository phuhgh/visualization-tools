import { TTypedArray } from "rc-js-util";
import { IIndexedDataConnector } from "./i-indexed-data-connector";
import { IInterleavedBindingDescriptor } from "./i-interleaved-binding-descriptor";

/**
 * @public
 * Interleaved implementation of {@link IIndexedDataConnector}
 */
export interface IInterleavedConnector<TArray extends TTypedArray, TOffsets>
    extends IIndexedDataConnector<TOffsets>
{
    getInterleavedBuffer(): TArray;
    getDescriptor(): IInterleavedBindingDescriptor<TOffsets>;
}