import { TUnknownRenderer } from "../t-unknown-renderer";

/**
 * @public
 */
export function resetTransformComponents(renderer: TUnknownRenderer): void
{
    const transforms = renderer.transformComponents.getAllTransforms();

    for (let i = 0, iEnd = transforms.length; i < iEnd; ++i)
    {
        transforms[i].resetState();
    }
}