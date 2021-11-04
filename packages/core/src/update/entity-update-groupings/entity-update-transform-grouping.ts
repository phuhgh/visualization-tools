import { IGraphicsComponent } from "../../rendering/graphics-components/i-graphics-component";
import { TUnknownComponentRenderer } from "../../rendering/t-unknown-component-renderer";
import { ITransformComponent } from "../../rendering/transform-components/i-transform-component";
import { TEntityTrait } from "../../entities/traits/t-entity-trait";
import { IEntityUpdateGrouping } from "./i-entity-update-grouping";

/**
 * @public
 * A grouping of a graphics component with its renderer and transform.
 */
export class EntityUpdateTransformGrouping<TUpdateArg, TRequiredTraits>
    implements IEntityUpdateGrouping<TUpdateArg, TRequiredTraits>
{
    public constructor
    (
        public readonly graphicsComponent: IGraphicsComponent<TUnknownComponentRenderer, TUpdateArg, TRequiredTraits>,
        public readonly componentRenderer: TUnknownComponentRenderer,
        public readonly transformComponent: ITransformComponent<TUnknownComponentRenderer, TUpdateArg, TRequiredTraits>,
        public readonly transformRenderer: TUnknownComponentRenderer,
    )
    {
    }

    public drawUpdateGroup
    (
        entities: TEntityTrait<TUpdateArg, TRequiredTraits>[],
        updateArg: TUpdateArg,
    )
        : void
    {
        const transformRenderer = this.transformRenderer;
        const componentRenderer = this.componentRenderer;
        const graphicsComponent = this.graphicsComponent;
        const transformComponent = this.transformComponent;

        for (let i = 0, iEnd = entities.length; i < iEnd; ++i)
        {
            const entity = entities[i];
            // transform
            transformRenderer.onBeforeDraw();
            graphicsComponent.transform.setOutputBuffers(entity, transformRenderer);
            transformComponent.performTransform(entity, transformRenderer, updateArg);
            transformRenderer.onAfterDraw();
            // gc update
            componentRenderer.onBeforeDraw();
            graphicsComponent.onBeforeUpdate(componentRenderer, updateArg);
            graphicsComponent.update(entity, componentRenderer, updateArg);
            componentRenderer.onAfterDraw();
        }
    }
}