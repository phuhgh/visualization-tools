import { IGraphicsComponent } from "../../rendering/graphics-components/i-graphics-component";
import { TUnknownComponentRenderer } from "../../rendering/t-unknown-component-renderer";
import { TEntityTrait } from "../../entities/traits/t-entity-trait";
import { IEntityUpdateGrouping } from "./i-entity-update-grouping";
import { swapBufferLayout } from "./swap-buffer-layout";

/**
 * @public
 * A plain update grouping.
 */
export class EntityUpdateGrouping<TUpdateArg, TRequiredTraits>
    implements IEntityUpdateGrouping<TUpdateArg, TRequiredTraits>
{
    public constructor
    (
        public readonly graphicsComponent: IGraphicsComponent<TUnknownComponentRenderer, TUpdateArg, TRequiredTraits>,
        public readonly componentRenderer: TUnknownComponentRenderer,
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
        const componentRenderer = this.componentRenderer;
        const entityBufferStore = this.componentRenderer.sharedState.entityBuffers;
        const graphicsComponent = this.graphicsComponent;
        const groupId = graphicsComponent.transform.groupId;

        componentRenderer.onBeforeDraw();
        graphicsComponent.onBeforeUpdate(componentRenderer, updateArg);

        for (let i = 0, iEnd = entities.length; i < iEnd; ++i)
        {
            const entity = entities[i];
            const entityBufferLayout = entityBufferStore.getLayout(entity, groupId);

            swapBufferLayout(graphicsComponent, entityBufferLayout);
            graphicsComponent.update(entity, componentRenderer, updateArg);
            swapBufferLayout(graphicsComponent, entityBufferLayout);
        }

        componentRenderer.onAfterDraw();
    }
}
