import { IBaseEntityRenderer } from "../../rendering/i-base-entity-renderer";
import { IPlot } from "../../plot/i-plot";
import { IChartEntity } from "../chart-entity";
import { IGraphicsComponentSpecification } from "../../rendering/i-graphics-component-specification";
import { IRenderer } from "../../rendering/i-renderer";
import { _Array } from "rc-js-util";
import { TEntityTrait } from "../traits/t-entity-trait";
import { TUnknownEntity } from "../t-unknown-entity";
import { IEntityGroup } from "../groups/a-entity-group";
import { ICategoryUpdateHooks } from "./i-category-update-hooks";
import { IUpdateGroupOptions } from "./i-update-group-options";
import { IEntityChangeHooks } from "./i-entity-change-hooks";
import { IEntityCategory } from "./i-entity-category";
import { TUnknownEntityRenderer } from "../../rendering/t-unknown-entity-renderer";
import { DummyEntityRenderer } from "../../rendering/dummy-entity-renderer";

/**
 * @public
 * Implementation of {@link IEntityCategory}, handles initialization of graphics components.
 */
export class EntityCategory<TEntityRenderer extends TUnknownEntityRenderer
    , TPlotRange
    , TUpdateArg
    , TRequiredTraits>
    implements IEntityCategory<TEntityRenderer, TUpdateArg, TRequiredTraits>
{
    public readonly updateHooks: ICategoryUpdateHooks<IRenderer<TEntityRenderer>, TUpdateArg>;

    public constructor
    (
        private readonly plot: IPlot<TPlotRange, TRequiredTraits>,
        private readonly renderer: IRenderer<TEntityRenderer>,
        private readonly updateGroup: IEntityGroup<IUpdateGroupOptions<TUpdateArg>, TRequiredTraits>,
        updateHooks: ICategoryUpdateHooks<IRenderer<TEntityRenderer>, TUpdateArg>,
    )
    {
        this.updateHooks = updateHooks;
    }

    public addEntity<TGraphicsTraits extends object, TSubcategoryTraits extends object>
    (
        entity: TEntityTrait<TUpdateArg, TGraphicsTraits & TSubcategoryTraits & TRequiredTraits>,
        graphicsComponent: IGraphicsComponentSpecification<TEntityRenderer, TUpdateArg, TGraphicsTraits>,
        hooks?: IEntityChangeHooks<TSubcategoryTraits>,
    )
        : void
    {
        const plot = this.plot;
        const equiv = this.renderer.graphicsComponents.get(graphicsComponent.getCacheId());
        graphicsComponent = equiv == null ? graphicsComponent : equiv;

        plot.addEntity(entity);
        plot.addToGroup(entity, this.updateGroup, { graphicsComponent: graphicsComponent });
        this.entities.push(entity);

        if (hooks != null)
        {
            hooks.onEntityAdded(entity);
        }

        if (equiv == null)
        {
            // first time we've seen this component
            initializeEntityRenderer(this.renderer, graphicsComponent);
        }
    }

    public removeEntity(entity: IChartEntity<TUpdateArg>): void
    {
        const removedOne = _Array.removeOne(this.entities, entity);

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

    public getEntities(): TEntityTrait<TUpdateArg, TRequiredTraits>[]
    {
        return this.entities;
    }

    private entities: TEntityTrait<TUpdateArg, TRequiredTraits>[] = [];
    private hooks: WeakMap<TUnknownEntity, IEntityChangeHooks<TUnknownEntity>> = new WeakMap();
}

function initializeEntityRenderer<TEntityRenderer extends TUnknownEntityRenderer>
(
    renderer: IRenderer<TEntityRenderer>,
    graphicsComponent: IGraphicsComponentSpecification<TEntityRenderer, unknown, unknown>,
)
    : void
{
    if (graphicsComponent.subComponents != null)
    {
        const subComponents = graphicsComponent.subComponents.getSubComponents();
        const entityRenderers = _Array.map(subComponents, comp =>
        {
            return initializeGraphicsComponent(renderer, comp);
        });
        graphicsComponent.subComponents.setEntityRenderers(entityRenderers);
        renderer.entityRendererProvider.initializeRenderer(graphicsComponent, () => new DummyEntityRenderer(renderer.sharedState) as TEntityRenderer);
    }
    else
    {
        initializeGraphicsComponent(renderer, graphicsComponent);
    }

    renderer.graphicsComponents.set(graphicsComponent.getCacheId(), graphicsComponent);
}

function initializeGraphicsComponent<TGcSpec, TCtx>
(
    renderer: IRenderer<IBaseEntityRenderer<TGcSpec, TCtx>>,
    graphicsComponent: IGraphicsComponentSpecification<IBaseEntityRenderer<TGcSpec, TCtx>, unknown, unknown>,
)
    : IBaseEntityRenderer<TGcSpec, TCtx>
{
    const entityRenderer = renderer.entityRendererProvider.initializeRenderer(graphicsComponent, () =>
    {
        return renderer.entityRendererFactory.createRenderer(graphicsComponent.specification);
    });

    entityRenderer.onBeforeInitialization();
    graphicsComponent.initialize(entityRenderer);
    entityRenderer.onAfterInitialization();

    return entityRenderer;
}