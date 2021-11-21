import { IGraphicsComponent } from "../../rendering/graphics-components/i-graphics-component";
import { TUnknownComponentRenderer } from "../../rendering/t-unknown-component-renderer";
import { ITransformComponent } from "../../rendering/transform-components/i-transform-component";
import { TEntityTrait } from "../../entities/traits/t-entity-trait";
import { IEntityUpdateGrouping } from "./i-entity-update-grouping";
import { swapBufferLayout } from "./swap-buffer-layout";

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
        const entityBufferStore = this.componentRenderer.sharedState.entityBuffers;
        const groupId = graphicsComponent.transform.groupId;

        for (let i = 0, iEnd = entities.length; i < iEnd; ++i)
        {
            const entity = entities[i];

            if (entity.isFiltered)
            {
                continue;
            }

            const entityBufferLayout = entityBufferStore.getLayout(entity, groupId);

            // if the entity has buffers, use them
            swapBufferLayout(graphicsComponent, entityBufferLayout);

            if (graphicsComponent.transform.isTransformRequired(entity, updateArg))
            {
                // transform
                transformRenderer.onBeforeDraw();
                graphicsComponent.transform.setOutputBuffers(entity, transformRenderer);
                transformComponent.performTransform(entity, transformRenderer, updateArg);
                transformRenderer.onAfterDraw();
            }

            // gc update
            componentRenderer.onBeforeDraw();
            graphicsComponent.onBeforeUpdate(componentRenderer, updateArg);
            graphicsComponent.update(entity, componentRenderer, updateArg);
            componentRenderer.onAfterDraw();

            // swap back
            swapBufferLayout(graphicsComponent, entityBufferLayout);
        }
    }
}