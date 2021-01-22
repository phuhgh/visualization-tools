import { EntityUpdateGrouping, ICanvasDimensions, IGraphicsComponent, IPlotUpdateStrategy, IReadonlyPlot, OnEntityAddedToGroup, OnEntityModified, OnEntityRemovedFromGroup, RenderList, TEntityTrait, TUnknownEntityRenderer, TUnknownRenderer } from "@visualization-tools/core";
import { IUpdate2dGroup } from "./update-2d-group";
import { IScene2d } from "./i-scene2d";
import { _Array } from "rc-js-util";

/**
 * @public
 * Sorts entities according to {@link IScene2d} and then batches entities to minimize draw calls. Respects
 * {@link @visualization-tools/core#IGraphicsComponentSpecification.groupUpdatesByEntity} flag.
 */
export class Sorted2dUpdateStrategy<TPlotRange, TUpdateArg, TRequiredTraits>
    implements IPlotUpdateStrategy<IUpdate2dGroup<TPlotRange, TUpdateArg, TRequiredTraits>>
{
    public updateGroup: IUpdate2dGroup<TPlotRange, TUpdateArg, TRequiredTraits>;

    public constructor
    (
        private plot: IReadonlyPlot<TPlotRange, TRequiredTraits>,
        updateGroup: IUpdate2dGroup<TPlotRange, TUpdateArg, TRequiredTraits>,
        private scene: IScene2d<TPlotRange, TUpdateArg, TRequiredTraits>,
    )
    {
        this.updateGroup = updateGroup;
        // no possibility of changing, so no need for unregistering
        OnEntityAddedToGroup.registerListener(this.plot, () => this.isDirty = true);
        OnEntityRemovedFromGroup.registerListener(this.plot, () => this.isDirty = true);
        OnEntityModified.registerListener(this.plot, () => this.isDirty = true);
    }

    public update
    (
        canvasDims: ICanvasDimensions,
        renderer: TUnknownRenderer,
    )
        : void
    {
        if (this.isDirty)
        {
            this.scene.update();
            this.updateRenderList(renderer);
            this.isDirty = false;
        }

        this.draw(renderer, canvasDims);
    }

    private updateRenderList(renderer: TUnknownRenderer): void
    {
        const categories = this.scene.getSortedCategories(this.updateGroup);
        const renderLists = this.renderLists = _Array.map(categories, category => new RenderList(category.updateHooks));
        const createEntityGrouping = Sorted2dUpdateStrategy.createEntityGrouping;

        for (let i = 0, iEnd = categories.length; i < iEnd; ++i)
        {
            const category = categories[i];
            const renderList = renderLists[i];
            const entitiesByComponents = this.scene.getEntitiesByComponents(category);

            for (let j = 0, jEnd = entitiesByComponents.length; j < jEnd; ++j)
            {
                const entitiesByComponent = entitiesByComponents[j];
                const graphicsComponent = entitiesByComponent[0];
                const entities = entitiesByComponent[1];
                renderList.addGrouping(createEntityGrouping(graphicsComponent, renderer));

                for (let k = 0, kEnd = entities.length; k < kEnd; ++k)
                {
                    renderList.addEntity(entities[k]);
                }
            }

            renderList.build();
        }
    }

    private static createEntityGrouping<TUpdateArg, TRequiredTraits>
    (
        graphicsComponent: IGraphicsComponent<TUnknownEntityRenderer, TUpdateArg, TRequiredTraits>,
        renderer: TUnknownRenderer,
    )
        : EntityUpdateGrouping<TUpdateArg, TRequiredTraits>
    {
        return new EntityUpdateGrouping(
            graphicsComponent,
            renderer.entityRendererProvider.getRenderer(graphicsComponent),
        );
    }

    private draw
    (
        renderer: TUnknownRenderer,
        canvasDims: ICanvasDimensions,
    )
        : void
    {
        const updateArg = this.updateGroup.updateArgProvider.getUpdateArg(this.plot, canvasDims);
        const renderLists = this.renderLists;
        const drawEntityGrouping = Sorted2dUpdateStrategy.drawEntityGrouping;

        for (let i = 0, iEnd = renderLists.length; i < iEnd; ++i)
        {
            const renderList = renderLists[i];
            renderList.updateGroupHooks.onBeforeUpdate(renderer, updateArg);

            const entitiesInGroup = renderList.entitiesInGroup;

            for (let j = 0, jEnd = entitiesInGroup.length; j < jEnd; ++j)
            {
                entitiesInGroup[j].onBeforeUpdate(updateArg);
            }

            const updateGroupings = renderList.groupings;

            for (let j = 0, jEnd = updateGroupings.length; j < jEnd; ++j)
            {
                const updateGrouping = updateGroupings[j];
                drawEntityGrouping(updateGrouping[0], updateGrouping[1], updateArg);
            }

            renderList.updateGroupHooks.onAfterUpdate(renderer, updateArg);
        }
    }

    private static drawEntityGrouping<TUpdateArg, TRequiredTraits>
    (
        updateGrouping: EntityUpdateGrouping<TUpdateArg, TRequiredTraits>,
        entities: TEntityTrait<TUpdateArg, TRequiredTraits>[],
        updateArg: TUpdateArg,
    )
        : void
    {
        const graphicsComponent = updateGrouping.graphicsComponent;

        if (graphicsComponent.groupUpdatesByEntity === true)
        {
            Sorted2dUpdateStrategy.drawPerEntity(graphicsComponent, entities, updateArg);
        }
        else
        {
            Sorted2dUpdateStrategy.drawEntitiesByComponent(updateGrouping, entities, updateArg);
        }
    }

    private static drawEntitiesByComponent<TUpdateArg, TRequiredTraits>
    (
        updateGrouping: EntityUpdateGrouping<TUpdateArg, TRequiredTraits>,
        entities: TEntityTrait<TUpdateArg, TRequiredTraits>[],
        updateArg: TUpdateArg,
    )
        : void
    {
        const entityRenderer = updateGrouping.entityRenderer;
        const graphicsComponent = updateGrouping.graphicsComponent;

        entityRenderer.onBeforeDraw();
        graphicsComponent.onBeforeUpdate(entityRenderer, updateArg);

        for (let i = 0, iEnd = entities.length; i < iEnd; ++i)
        {
            graphicsComponent.update(entities[i], entityRenderer, updateArg);
        }

        entityRenderer.onAfterDraw();
    }

    private static drawPerEntity<TUpdateArg, TRequiredTraits>
    (
        graphicsComponent: IGraphicsComponent<TUnknownEntityRenderer, TUpdateArg, TRequiredTraits>,
        entities: TEntityTrait<TUpdateArg, TRequiredTraits>[],
        updateArg: TUpdateArg,
    )
        : void
    {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const subComponents = graphicsComponent.subComponents!;
        const graphicsComponents = subComponents.getSubComponents();
        const entityRenderers = subComponents.entityRenderers;

        for (let i = 0, iEnd = entities.length; i < iEnd; ++i)
        {
            for (let j = 0, jEnd = graphicsComponents.length; j < jEnd; ++j)
            {
                const graphicsComponent = graphicsComponents[j];
                const entityRenderer = entityRenderers[j];

                entityRenderer.onBeforeDraw();
                graphicsComponent.onBeforeUpdate(entityRenderer, updateArg);
                graphicsComponent.update(entities[i], entityRenderer, updateArg);
                entityRenderer.onAfterDraw();
            }
        }
    }

    private renderLists: RenderList<TUpdateArg, TRequiredTraits>[] = [];
    private isDirty: boolean = true;
}
