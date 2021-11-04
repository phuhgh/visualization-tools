import { IGraphicsComponent } from "../../rendering/graphics-components/i-graphics-component";
import { TUnknownComponentRenderer } from "../../rendering/t-unknown-component-renderer";
import { TEntityTrait } from "../../entities/traits/t-entity-trait";
import { IEntityUpdateGrouping } from "./i-entity-update-grouping";

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
        const graphicsComponent = this.graphicsComponent;

        componentRenderer.onBeforeDraw();
        graphicsComponent.onBeforeUpdate(componentRenderer, updateArg);

        for (let i = 0, iEnd = entities.length; i < iEnd; ++i)
        {
            graphicsComponent.update(entities[i], componentRenderer, updateArg);
        }

        componentRenderer.onAfterDraw();
    }
}
