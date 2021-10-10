import { IGraphicsComponentSpecification } from "../graphics-components/i-graphics-component-specification";
import { IComponentRendererFactory } from "./i-component-renderer-factory";
import { TUnknownComponentRenderer } from "../t-unknown-component-renderer";
import { TExtractGcSpec } from "./t-extract-gc-spec";

/**
 * @public
 * Wrapper of {@link IComponentRendererFactory} to get entity renderers.
 */
export interface IComponentRendererProvider<TComponentRenderer extends TUnknownComponentRenderer>
{
    getRenderer(graphicsComponent: IGraphicsComponentSpecification<TComponentRenderer>): TComponentRenderer;
    /**
     * Only calls create if not present.
     */
    initializeRenderer
    (
        graphicsComponent: IGraphicsComponentSpecification<TComponentRenderer>,
        create: () => TComponentRenderer,
    )
        : TComponentRenderer;

    onContextLost(): void;
    reinitializeRenderers(factory: IComponentRendererFactory<TExtractGcSpec<TComponentRenderer>, TComponentRenderer>): void;
}