import { IPlot } from "../../plot/i-plot";
import { IChartEntity } from "../chart-entity";
import { IRenderer } from "../../rendering/i-renderer";
import { _Production, DirtyCheckedUniqueCollection } from "rc-js-util";
import { TEntityTrait } from "../traits/t-entity-trait";
import { TUnknownEntity } from "../t-unknown-entity";
import { IEntityGroup } from "../groups/a-entity-group";
import { ICategoryUpdateHooks } from "./i-category-update-hooks";
import { IUpdateGroupOptions } from "./i-update-group-options";
import { IEntityChangeHooks } from "./i-entity-change-hooks";
import { IEntityCategory } from "./i-entity-category";
import { TUnknownComponentRenderer } from "../../rendering/t-unknown-component-renderer";
import { TGraphicsComponent } from "../../rendering/graphics-components/t-graphics-component";
import { EGraphicsComponentType } from "../../rendering/graphics-components/e-graphics-component-type";
import { IGraphicsComponent } from "../../rendering/graphics-components/i-graphics-component";
import { initializeGraphicsComponent } from "../../rendering/graphics-components/initialize-graphics-component";
import { Plot } from "../../plot/plot";
import { OnGraphicsComponentAdded } from "../../rendering/events/on-graphics-component-added";
import { IPlotRange } from "../../plot/i-plot-range";

/**
 * @public
 * Implementation of {@link IEntityCategory}, handles initialization of graphics components.
 */
export class EntityCategory<TComponentRenderer extends TUnknownComponentRenderer
    , TUpdateArg
    , TRequiredTraits>
    implements IEntityCategory<TComponentRenderer, TUpdateArg, TRequiredTraits>
{
    public readonly updateHooks: ICategoryUpdateHooks<IRenderer<TComponentRenderer>, TUpdateArg>;

    public constructor
    (
        private readonly plot: IPlot<IPlotRange, TRequiredTraits>,
        private readonly renderer: IRenderer<TComponentRenderer>,
        private readonly updateGroup: IEntityGroup<IUpdateGroupOptions<TUpdateArg>, TRequiredTraits>,
        updateHooks: ICategoryUpdateHooks<IRenderer<TComponentRenderer>, TUpdateArg>,
    )
    {
        this.updateHooks = updateHooks;
    }

    public setBufferPerEntity(enabled: boolean): void
    {
        this.bufferPerEntity = enabled;
    }

    public addEntity<TGraphicsTraits extends object, TSubcategoryTraits extends object>
    (
        entity: TEntityTrait<TUpdateArg, TGraphicsTraits & TSubcategoryTraits & TRequiredTraits>,
        graphicsComponent: TGraphicsComponent<TComponentRenderer, TUpdateArg, TGraphicsTraits>,
        hooks?: IEntityChangeHooks<TSubcategoryTraits>,
    )
        : void
    {
        switch (graphicsComponent.type)
        {
            case EGraphicsComponentType.Composite:
            {
                graphicsComponent.recurseIterate(EGraphicsComponentType.Entity, (
                    component,
                    containingComponent,
                    index,
                ) =>
                {
                    const initializedComponent = this.getInitializedGraphicsComponent(component);
                    containingComponent.subComponents.setSubComponent(initializedComponent, index);
                    this.initializeEntityBuffers(initializedComponent, entity);
                });
                break;
            }
            case EGraphicsComponentType.Entity:
            {
                graphicsComponent = this.getInitializedGraphicsComponent(graphicsComponent);
                this.initializeEntityBuffers(graphicsComponent, entity);

                break;
            }
            default:
                _Production.assertValueIsNever(graphicsComponent);
        }

        this.plot.addEntity(entity);
        this.plot.addToGroup(entity, this.updateGroup, { graphicsComponent: graphicsComponent });
        this.entities.add(entity);

        if (hooks != null)
        {
            hooks.onEntityAdded(entity);
        }
    }

    public removeEntity(entity: IChartEntity<TUpdateArg>): void
    {
        const removedOne = this.entities.delete(entity as TEntityTrait<TUpdateArg, TRequiredTraits>);

        if (!removedOne)
        {
            return;
        }

        const hooks = this.hooks.get(entity);

        if (hooks != null)
        {
            hooks.onEntityRemoved(entity);
        }
    }

    public getEntities(): readonly TEntityTrait<TUpdateArg, TRequiredTraits>[]
    {
        return this.entities.getArray();
    }

    private getInitializedGraphicsComponent<TGraphicsTraits extends object>
    (
        graphicsComponent: IGraphicsComponent<TComponentRenderer, TUpdateArg, TGraphicsTraits>,
    )
        : IGraphicsComponent<TComponentRenderer, TUpdateArg, TGraphicsTraits>
    {
        const equiv = this.renderer.graphicsComponents.getComponent(graphicsComponent.getCacheId()) as IGraphicsComponent<TComponentRenderer, TUpdateArg, TGraphicsTraits>;

        if (equiv == null)
        {
            // first time we've seen this component
            initializeGraphicsComponent(this.renderer, graphicsComponent);
            OnGraphicsComponentAdded.emit(Plot.getChartEventService(this.plot), graphicsComponent);
            return graphicsComponent;
        }
        else
        {
            return equiv;
        }
    }

    private initializeEntityBuffers
    (
        graphicsComponent: IGraphicsComponent<TComponentRenderer, TUpdateArg, unknown>,
        entity: TUnknownEntity,
    )
        : void
    {
        if (!this.bufferPerEntity || graphicsComponent.transform.bufferLayoutProvider == null)
        {
            return;
        }

        const layout = graphicsComponent.transform.bufferLayoutProvider.getBufferLayout();

        if (this.renderer.sharedState.entityBuffers.setNewLayout(entity, graphicsComponent.transform.groupId, layout))
        {
            this.renderer.initializeBuffers(layout.getBuffers());
        }
    }

    private entities = new DirtyCheckedUniqueCollection<TEntityTrait<TUpdateArg, TRequiredTraits>>();
    private hooks: WeakMap<TUnknownEntity, IEntityChangeHooks<TUnknownEntity>> = new WeakMap();
    private bufferPerEntity = false;
    public TComponentRenderer!: TComponentRenderer;
}
