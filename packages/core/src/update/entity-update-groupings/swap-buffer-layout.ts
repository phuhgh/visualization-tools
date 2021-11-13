import { IGraphicsComponent } from "../../rendering/graphics-components/i-graphics-component";
import { TUnknownComponentRenderer } from "../../rendering/t-unknown-component-renderer";
import { TUnknownBufferLayout } from "../../rendering/buffers/buffer-layout";

/**
 * @internal
 */
export function swapBufferLayout<TUpdateArg, TRequiredTraits>
(
    graphicsComponent: IGraphicsComponent<TUnknownComponentRenderer, TUpdateArg, TRequiredTraits>,
    entityBufferLayout: TUnknownBufferLayout | undefined,
)
    : void
{
    if (graphicsComponent.transform.bufferLayoutProvider && entityBufferLayout != null)
    {
        graphicsComponent.transform.bufferLayoutProvider.setBufferLayout(entityBufferLayout);
    }
}