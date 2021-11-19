import { EGraphicsComponentType, EntityUpdateGrouping, EntityUpdateTransformGrouping, ICanvasDimensions, IEntityUpdateGrouping, IGraphicsComponent, IPlotRange, IPlotUpdateStrategy, IReadonlyPlot, ITransformComponent, IUserTransform, OnEntityAddedToGroup, OnEntityModified, OnEntityRemovedFromGroup, OnRendererContextLost, RenderList, resetEntityBuffers, resetTransformComponents, TGraphicsComponent, TUnknownComponentRenderer, TUnknownRenderer, UpdateTransformGroupingByEntity } from "@visualization-tools/core";
import { IUpdate2dGroup } from "../update-group/update-2d-group";
import { IScene2d } from "./i-scene2d";
import { _Array, _Debug, _Production } from "rc-js-util";

// FIXME: split this up, add tests
/**
 * @public
 * Sorts entities according to {@link IScene2d} and then batches entities to minimize draw calls. Respects
 * {@link @visualization-tools/core#IGraphicsComponentSpecification.groupUpdatesByEntity} flag.
 */
export class Sorted2dUpdateStrategy<TPlotRange extends IPlotRange, TUpdateArg, TRequiredTraits>
    implements IPlotUpdateStrategy<IUpdate2dGroup<TPlotRange, TUpdateArg, TRequiredTraits>>
{
    public updateGroup: IUpdate2dGroup<TPlotRange, TUpdateArg, TRequiredTraits>;

    public constructor
    (
        private plot: IReadonlyPlot<TPlotRange, TRequiredTraits>,
        updateGroup: IUpdate2dGroup<TPlotRange, TUpdateArg, TRequiredTraits>,
        private scene: IScene2d<TPlotRange, TUpdateArg, TRequiredTraits>,
        private getUserTransform: (updateArg: TUpdateArg) => IUserTransform,
    )
    {
        this.updateGroup = updateGroup;
        // no possibility of changing, so no need for unregistering
        OnEntityAddedToGroup.registerListener(this.plot, () => this.isDirty = true);
        OnEntityRemovedFromGroup.registerListener(this.plot, () => this.isDirty = true);
        OnEntityModified.registerListener(this.plot, () => this.isDirty = true);
        OnRendererContextLost.registerListener(this.plot.eventService, () => this.isDirty = true);
    }

    public update
    (
        canvasDims: ICanvasDimensions,
        renderer: TUnknownRenderer,
    )
        : void
    {
        const updateArg = this.updateGroup.updateArgProvider.getUpdateArg(this.plot, canvasDims);

        const currentUserTransform = this.getUserTransform(updateArg);

        if (this.lastUserTransformId !== currentUserTransform.changeId)
        {
            this.isDirty = true;
            this.lastUserTransformId = currentUserTransform.changeId;
            resetEntityBuffers(renderer);
            resetTransformComponents(renderer);
        }

        if (this.isDirty)
        {
            this.scene.update();
            this.updateRenderList(renderer, updateArg);
            this.isDirty = false;
        }

        this.drawRenderList(renderer, updateArg);
    }

    private drawRenderList
    (
        renderer: TUnknownRenderer,
        updateArg: TUpdateArg,
    )
        : void
    {
        const renderLists = this.renderLists;

        for (let i = 0, iEnd = renderLists.length; i < iEnd; ++i)
        {
            const renderList = renderLists[i];
            renderList.updateGroupHooks.onBeforeUpdate(renderer, updateArg);

            const entitiesInGroup = renderList.uniqueEntities;

            for (let j = 0, jEnd = entitiesInGroup.length; j < jEnd; ++j)
            {
                entitiesInGroup[j].onBeforeUpdate(updateArg);
            }

            const updateGroupings = renderList.groupings;

            for (let j = 0, jEnd = updateGroupings.length; j < jEnd; ++j)
            {
                const updateGrouping = updateGroupings[j];
                updateGrouping[0].drawUpdateGroup(updateGrouping[1], updateArg);
            }

            renderList.updateGroupHooks.onAfterUpdate(renderer, updateArg);
        }
    }

    private updateRenderList
    (
        renderer: TUnknownRenderer,
        updateArg: TUpdateArg,
    )
        : void
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
                renderList.addGrouping(createEntityGrouping(graphicsComponent, renderer, updateArg));

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
        graphicsComponent: TGraphicsComponent<TUnknownComponentRenderer, TUpdateArg, TRequiredTraits>,
        renderer: TUnknownRenderer,
        updateArg: TUpdateArg,
    )
        : IEntityUpdateGrouping<TUpdateArg, TRequiredTraits>
    {
        switch (graphicsComponent.type)
        {
            case EGraphicsComponentType.Entity:
            {
                const componentRenderer = renderer.componentRendererProvider.getRenderer(graphicsComponent);
                graphicsComponent.transform.updateTransform(renderer, updateArg);

                if (graphicsComponent.transform.transformComponent == null)
                {
                    return new EntityUpdateGrouping(graphicsComponent, componentRenderer);
                }
                else
                {
                    return new EntityUpdateTransformGrouping(
                        graphicsComponent,
                        componentRenderer,
                        graphicsComponent.transform.transformComponent,
                        renderer.componentRendererProvider.getRenderer(graphicsComponent.transform.transformComponent),
                    );
                }
            }
            case  EGraphicsComponentType.Composite:
            {
                // non update by entity should have been stripped by this point
                DEBUG_MODE && _Debug.assert(graphicsComponent.groupUpdatesByEntity, "precondition fail");
                const graphicsComponents: IGraphicsComponent<TUnknownComponentRenderer, TUpdateArg, TRequiredTraits>[] = [];
                const entityRenderers: TUnknownComponentRenderer[] = [];
                const transformComponents: (ITransformComponent<TUnknownComponentRenderer, TUpdateArg, TRequiredTraits> | null)[] = [];
                const transformRenderers: (TUnknownComponentRenderer | null)[] = [];

                graphicsComponent.recurseIterate(EGraphicsComponentType.Entity, (nestedComponent) =>
                {
                    const componentRenderer = renderer.componentRendererProvider.getRenderer(nestedComponent);
                    graphicsComponents.push(nestedComponent);
                    entityRenderers.push(componentRenderer);

                    nestedComponent.transform.updateTransform(renderer, updateArg);

                    if (nestedComponent.transform.transformComponent != null)
                    {
                        transformComponents.push(nestedComponent.transform.transformComponent);
                        transformRenderers.push(renderer.componentRendererProvider.getRenderer(nestedComponent.transform.transformComponent));
                    }
                    else
                    {
                        transformComponents.push(null);
                        transformRenderers.push(null);
                    }
                });

                return new UpdateTransformGroupingByEntity(
                    graphicsComponents,
                    entityRenderers,
                    transformComponents,
                    transformRenderers,
                );
            }
            default:
                _Production.assertValueIsNever(graphicsComponent);
        }
    }

    private renderLists: RenderList<TUpdateArg, TRequiredTraits>[] = [];
    private isDirty: boolean = true;
    private lastUserTransformId: number = -1;
}