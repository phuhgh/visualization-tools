import { IBuffer } from "./i-buffer";
import { _Debug } from "rc-js-util";

/**
 * @public
 */
export type TUnknownBufferLayout = IBufferLayout<IBuffer>;

/**
 * @public
 */
export interface IBufferLayout<TBuffer extends IBuffer>
{
    getBufferCount(): number;
    getBuffers(): readonly TBuffer[];
}

/**
 * @public
 */
export class BufferLayout<TBuffer extends IBuffer> implements IBufferLayout<TBuffer>
{
    public constructor
    (
        private buffers: TBuffer[],
    )
    {
    }

    public getBufferCount(): number
    {
        return this.buffers.length;
    }

    public getBuffers(): readonly TBuffer[]
    {
        return this.buffers;
    }

    /**
     * Swaps the buffer at the index to the argument, returning the stored buffer.
     */
    public swapBuffer(buffer: TBuffer, index: number): TBuffer
    {
        DEBUG_MODE && _Debug.runBlock(() => {
            _Debug.assert(this.buffers.length > index, "index OOB");
            _Debug.assert(this.buffers[index] !== buffer, "attempted self swap");
        });
        const stored = this.buffers[index];
        this.buffers[index] = buffer;

        return stored;
    }
}

