import { TGl2ComponentRenderer } from "../rendering/gl/component-renderer/t-gl2-component-renderer";
import { IGraphicsComponent } from "../rendering/graphics-components/i-graphics-component";
import { TGlExtensionKeys } from "../rendering/gl/i-gl-extensions";
import { TestGl2RendererHarness } from "./test-gl2-renderer-harness";

/**
 * @internal
 */
export function updateTestGc<TExts extends TGlExtensionKeys, TUpdateArg, TEntityTraits>
(
    testRendererHarness: TestGl2RendererHarness<TExts>,
    testGraphicsComponent: IGraphicsComponent<TGl2ComponentRenderer<TExts>, TUpdateArg, TEntityTraits>,
    entity: TEntityTraits,
    updateArg: TUpdateArg,
)
    : void
{
    const componentRenderer = testRendererHarness.renderer.componentRendererFactory.createRenderer(testGraphicsComponent.specification);

    componentRenderer.onBeforeInitialization();
    testGraphicsComponent.initialize(componentRenderer);
    componentRenderer.onAfterInitialization();

    componentRenderer.onBeforeDraw();
    testGraphicsComponent.onBeforeUpdate(componentRenderer, updateArg);
    testGraphicsComponent.update(entity, componentRenderer, updateArg);
    componentRenderer.onAfterDraw();
}