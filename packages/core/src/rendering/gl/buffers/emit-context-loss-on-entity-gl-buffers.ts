import { IGlBuffer } from "./i-gl-buffer";
import { TTypedArray } from "rc-js-util";
import { IEntityBufferStore } from "../../buffers/entity-buffer-store";
import { IBufferLayout } from "../../buffers/buffer-layout";

/**
 * @internal
 */
export function emitContextLossOnEntityGlBuffers
(
    entityBuffers: IEntityBufferStore<IBufferLayout<IGlBuffer<TTypedArray>>>,
)
    : void
{
    const layouts = entityBuffers.getAllLayouts();

    for (let i = 0, iEnd = layouts.length; i < iEnd; ++i)
    {
        const buffers = layouts[i].getBuffers();

        for (let j = 0, jEnd = buffers.length; j < jEnd; ++j)
        {
            buffers[j].onContextLost();
        }
    }
}
