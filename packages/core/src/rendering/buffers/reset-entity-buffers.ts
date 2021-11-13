import { TUnknownRenderer } from "../t-unknown-renderer";

/**
 * @public
 */
export function resetEntityBuffers(renderer: TUnknownRenderer): void
{
    const layouts = renderer.sharedState.entityBuffers.getAllLayouts();

    for (let i = 0, iEnd = layouts.length; i < iEnd; ++i)
    {
        const buffers = layouts[i].getBuffers();

        for (let j = 0, jEnd = buffers.length; j < jEnd; ++j)
        {
            buffers[j].resetState();
        }
    }
}