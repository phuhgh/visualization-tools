import { IGraphicsComponentSpecification } from "./i-graphics-component-specification";
import { TUnknownEntityRenderer } from "./t-unknown-entity-renderer";

/**
 * @public
 * Children components of a {@link CompositeGraphicsComponent}.
 */
export interface IGraphicsSubComponents<TEntityRenderer extends TUnknownEntityRenderer, TUpdateArg, TEntityTraits>
{
    readonly entityRenderers: TUnknownEntityRenderer[];
    getSubComponents(): IGraphicsComponentSpecification<TEntityRenderer, TUpdateArg, TEntityTraits>[];
    setEntityRenderers(entityRenderers: TUnknownEntityRenderer[]): void;
}

/**
 * @public
 * {@inheritDoc IGraphicsSubComponents}
 */
export class GraphicsSubComponents<TEntityRenderer extends TUnknownEntityRenderer, TUpdateArg, TEntityTraits>
    implements IGraphicsSubComponents<TEntityRenderer, TUpdateArg, TEntityTraits>
{
    public entityRenderers: TUnknownEntityRenderer[] = [];

    public constructor
    (
        private readonly graphicsComponents: IGraphicsComponentSpecification<TEntityRenderer, TUpdateArg, TEntityTraits>[],
    )
    {
    }

    public getSubComponents(): IGraphicsComponentSpecification<TEntityRenderer, TUpdateArg, TEntityTraits>[]
    {
        return this.graphicsComponents;
    }

    public setEntityRenderers(entityRenderers: TUnknownEntityRenderer[]): void
    {
        this.entityRenderers = entityRenderers;
    }

}