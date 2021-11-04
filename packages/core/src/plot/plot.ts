import { _Array, _Debug, _Map, DirtyCheckedUniqueCollection, IDirtyCheckedUniqueCollection, IIdentifierFactory } from "rc-js-util";
import { TEntityTrait } from "../entities/traits/t-entity-trait";
import { IPlotEventTargetProvider } from "../eventing/user-interaction/i-plot-event-target-provider";
import { IEntityGroup } from "../entities/groups/a-entity-group";
import { IPlotInteractionConnector } from "./interaction-connector/i-plot-interaction-connector";
import { IPlot, IReadonlyPlot } from "./i-plot";
import { IPlotArea } from "./i-plot-area";
import { IChartEntity } from "../entities/chart-entity";
import { IPlotDimensions, PlotDimensions } from "./plot-dimensions";
import { EventService, IEventService } from "../eventing/event-service";
import { IGraphAttachPoint } from "../templating/graph-attach-point";
import { TUnknownEntity } from "../entities/t-unknown-entity";
import { IPlotUpdateStrategy } from "../update/i-plot-update-strategy";
import { IPlotCtorArg } from "./plot-ctor-arg";
import { TGetChartEventTargetProviders } from "./interaction-connector/t-get-chart-event-target-providers";
import { TInitialChartStateFactory } from "./interaction-connector/t-initial-chart-state-factory";
import { IDefaultTargets } from "../eventing/user-interaction/i-default-targets";
import { OnEntityRemoved } from "./events/on-entity-removed";
import { OnEntityAdded } from "./events/on-entity-added";
import { OnEntityAddedToGroup } from "./events/on-entity-added-to-group";
import { OnEntityRemovedFromGroup } from "./events/on-entity-removed-from-group";

/**
 * @public
 * {@inheritDoc IPlot}
 */
export class Plot<TPlotRange, TRequiredTraits>
    implements IPlot<TPlotRange, TRequiredTraits>
{
    public readonly attachPoint: IGraphAttachPoint;
    public plotRange: TPlotRange;
    public plotDimensionsOTL: IPlotDimensions;
    public plotDimensionsOBL: IPlotDimensions;
    public readonly plotName: string | null;
    public readonly eventService: IEventService = new EventService();
    public readonly updateStrategy: IPlotUpdateStrategy<IEntityGroup<unknown, TRequiredTraits>>;
    public readonly changeIdFactory: IIdentifierFactory;

    public constructor
    (
        arg: IPlotCtorArg<TPlotRange, IEntityGroup<unknown, TRequiredTraits>, TRequiredTraits>,
    )
    {
        this.changeIdFactory = arg.chart.changeIdFactory;
        this.plotRange = arg.plotOptions.plotRange;
        this.plotName = arg.plotOptions.plotName ?? null;
        this.chartEventService = arg.chart.eventService;
        this.attachPoint = arg.chart.attachPoint;
        this.plotDimensionsOTL = PlotDimensions.createOneOTL(arg.plotArea, this.attachPoint.canvasDims);
        this.plotDimensionsOBL = PlotDimensions.createOneOBL(arg.plotArea, this.attachPoint.canvasDims);
        this.updateStrategy = arg.plotOptions.createUpdateStrategy(this, arg.plotOptions.updateGroup);
    }

    public static getChartEventService(plot: IReadonlyPlot<unknown, unknown>): IEventService
    {
        return (plot as Plot<unknown, unknown>).chartEventService;
    }

    public onCanvasResized = (): void =>
    {
        this.setPlotArea(this.plotDimensionsOBL.clipSpaceArea);
    };

    public getInteractionHandler(): IPlotInteractionConnector<TPlotRange> | null
    {
        return this.interactionHandler;
    }

    public setInteractionHandler<TTarget extends object = IDefaultTargets>
    (
        interactionHandler: IPlotInteractionConnector<TPlotRange>,
        getTargetProviders: TGetChartEventTargetProviders<TTarget>,
        initialStateProvider: TInitialChartStateFactory<TPlotRange, TTarget>,
    )
        : IPlotEventTargetProvider<TTarget>
    {
        this.clearInteractionHandler();
        this.interactionHandler = interactionHandler;

        return this.interactionHandler.register(
            this,
            this.chartEventService,
            getTargetProviders,
            initialStateProvider,
        );
    }

    public clearInteractionHandler(): void
    {
        if (this.interactionHandler != null)
        {
            this.interactionHandler.unregister(this.chartEventService);
            this.interactionHandler = null;
        }
    }

    public setPlotArea(plotClipSpaceArea: IPlotArea): void
    {
        this.plotDimensionsOTL = PlotDimensions.createOneOTL(plotClipSpaceArea, this.attachPoint.canvasDims);
        this.plotDimensionsOBL = PlotDimensions.createOneOBL(plotClipSpaceArea, this.attachPoint.canvasDims);
    }

    public addEntity
    (
        entity: IChartEntity<unknown> & TRequiredTraits,
    )
        : void
    {
        if (this.entities.has(entity))
        {
            return;
        }

        if (entity.changeId === -1)
        {
            entity.changeId = this.changeIdFactory.getNextId();
        }

        this.entities.add(entity);
        OnEntityAdded.emit(this, entity);
    }

    public removeEntity(entity: TUnknownEntity): void
    {
        const removedEntity = this.entities.delete(entity);

        if (!removedEntity)
        {
            return;
        }

        const groups = this.groupsByEntities.get(entity);

        if (groups != null)
        {
            groups.forEach(group =>
            {
                const entities = this.entitiesByGroup.get(group);

                if (entities != null)
                {
                    DEBUG_MODE && _Debug.assert(entities.has(entity), "expected entity to be in group");
                    entities.delete(entity);
                    group.onEntityRemoved(entity);
                    OnEntityRemovedFromGroup.emit(this, entity as TEntityTrait<unknown, TRequiredTraits>, group);
                }
            });

        }
        OnEntityRemoved.emit(this, entity as TEntityTrait<unknown, TRequiredTraits>);
    }

    public addToGroup<TUpdateArg, TOptions, TGroupTraits>
    (
        entity: TEntityTrait<TUpdateArg, TRequiredTraits> & TGroupTraits,
        group: IEntityGroup<TOptions, TGroupTraits>,
        options: TOptions,
    )
        : boolean
    {
        DEBUG_MODE && _Debug.assert(this.entities.has(entity), "entity must be added before adding a trait");

        const added = DirtyCheckedUniqueCollection.mapInitializeAdd(this.entitiesByGroup, group, entity);
        _Map.addToSet(this.groupsByEntities, entity, group);

        if (added)
        {
            group.onEntityAdded(entity, options);
            OnEntityAddedToGroup.emit(this, entity, group);
        }

        return added;
    }

    public removeFromGroup<TGroupTraits>
    (
        entity: TEntityTrait<unknown, TRequiredTraits> & TGroupTraits,
        group: IEntityGroup<unknown, TGroupTraits>,
    )
        : boolean
    {
        _Map.deleteFromSet(this.groupsByEntities, entity, group);
        const removed = _Map.deleteFromSet(this.entitiesByGroup, group, entity);

        if (removed)
        {
            group.onEntityRemoved(entity);
            OnEntityRemovedFromGroup.emit(this, entity, group);
        }

        return removed;
    }

    public getEntitiesInGroup<TTrait>
    (
        trait: IEntityGroup<unknown, TTrait>,
    )
        : readonly TEntityTrait<unknown, TTrait & TRequiredTraits>[]
    {
        const entitiesByAncillaryObject = this.entitiesByGroup.get(trait);

        if (entitiesByAncillaryObject == null)
        {
            return _Array.emptyArray;
        }

        return entitiesByAncillaryObject.getArray() as TEntityTrait<unknown, TTrait & TRequiredTraits>[];
    }

    protected interactionHandler: IPlotInteractionConnector<TPlotRange> | null = null;
    protected chartEventService: IEventService;
    private readonly entities = new Set<IChartEntity<unknown>>();
    private readonly entitiesByGroup = new Map<IEntityGroup<unknown, unknown>, IDirtyCheckedUniqueCollection<IChartEntity<unknown>>>();
    private readonly groupsByEntities = new Map<IChartEntity<unknown>, Set<IEntityGroup<unknown, unknown>>>();
}