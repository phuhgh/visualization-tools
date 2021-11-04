import { IRenderer } from "../i-renderer";
import { TUnknownComponentRenderer } from "../t-unknown-component-renderer";
import { IGraphicsComponentSpecification } from "./i-graphics-component-specification";

/**
 * @internal
 */
export function initializeGraphicsComponent<TComponentRenderer extends TUnknownComponentRenderer>
(
    renderer: IRenderer<TComponentRenderer>,
    component: IGraphicsComponentSpecification<TComponentRenderer>,
)
    : void
{
    const componentRenderer = renderer.componentRendererProvider.initializeRenderer(component, () =>
    {
        return renderer.componentRendererFactory.createRenderer(component.specification);
    });

    componentRenderer.onBeforeInitialization();
    component.initialize(componentRenderer);
    componentRenderer.onAfterInitialization();

    renderer.graphicsComponents.setComponent(component);
}