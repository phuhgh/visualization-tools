import { TTypedArray } from "rc-js-util";
import { IInterleavedConnector } from "./i-interleaved-connector";
import { AInterleavedConnector, IInterleavedConfig } from "./a-interleaved-connector";

/**
 * @public
 * {@inheritDoc IInterleavedConnector}
 */
export class InterleavedConnector<TArray extends TTypedArray, TOffsets>
    extends AInterleavedConnector<TArray, TOffsets>
    implements IInterleavedConnector<TArray, TOffsets>
{
    public constructor
    (
        private readonly data: TArray,
        config: IInterleavedConfig<TOffsets>,
    )
    {
        super(config, data.length, data.BYTES_PER_ELEMENT);
    }

    public getData(): TArray
    {
        return this.data;
    }
}
