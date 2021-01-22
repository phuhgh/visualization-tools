import { IGraphicsComponentSpecification } from "./i-graphics-component-specification";
import { IEntityRendererFactory } from "./i-entity-renderer-factory";
import { TUnknownEntityRenderer } from "./t-unknown-entity-renderer";
import { TExtractGcSpec } from "./t-extract-gc-spec";

/**
 * @public
 * Wrapper of {@link IEntityRendererFactory} to get entity renderers.
 */
export interface IEntityRendererProvider<TEntityRenderer extends TUnknownEntityRenderer>
{
    getRenderer(graphicsComponent: IGraphicsComponentSpecification<TEntityRenderer, unknown, unknown>): TEntityRenderer;
    /**
     * Only calls create if not present.
     */
    initializeRenderer
    (
        graphicsComponent: IGraphicsComponentSpecification<TEntityRenderer, unknown, unknown>,
        create: () => TEntityRenderer,
    )
        : TEntityRenderer;

    reinitializeRenderers(factory: IEntityRendererFactory<TExtractGcSpec<TEntityRenderer>, TEntityRenderer>): void;
}