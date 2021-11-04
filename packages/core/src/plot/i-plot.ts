import { IEntityGroup } from "../entities/groups/a-entity-group";
import { TEntityTrait } from "../entities/traits/t-entity-trait";
import { IPlotInteractionConnector } from "./interaction-connector/i-plot-interaction-connector";
import { IPlotEventTargetProvider } from "../eventing/user-interaction/i-plot-event-target-provider";
import { IPlotArea } from "./i-plot-area";
import { TUnknownEntity } from "../entities/t-unknown-entity";
import { IPlotDimensions } from "./plot-dimensions";
import { IEventService } from "../eventing/event-service";
import { TOnCanvasResized } from "../templating/events/on-canvas-resized";
import { IPlotUpdateStrategy } from "../update/i-plot-update-strategy";
import { TGetChartEventTargetProviders } from "./interaction-connector/t-get-chart-event-target-providers";
import { TInitialChartStateFactory } from "./interaction-connector/t-initial-chart-state-factory";
import { IDefaultTargets } from "../eventing/user-interaction/i-default-targets";
import { IGraphAttachPoint } from "../templating/graph-attach-point";
import { IIdentifierFactory } from "rc-js-util";

/**
 * @public
 * Basic drawing unit to which entities and behaviors can be attached.
 */
export interface IPlot<TPlotRange, TRequiredTraits>
    extends IReadonlyPlot<TPlotRange, TRequiredTraits>,
            IWritablePlot<TRequiredTraits>,
            TOnCanvasResized
{
}

/**
 * @public
 * Non-mutative methods of a plot.
 */
export interface IReadonlyPlot<TPlotRange, TRequiredTraits>
{
    readonly plotName: string | null;
    readonly plotRange: Readonly<TPlotRange>;
    /**
     * Origin top left (OTL).
     */
    readonly plotDimensionsOTL: IPlotDimensions;
    /**
     * Origin bottom left (OBL).
     */
    readonly plotDimensionsOBL: IPlotDimensions;
    readonly eventService: IEventService,
    readonly updateStrategy: IPlotUpdateStrategy<IEntityGroup<unknown, TRequiredTraits>>;
    readonly attachPoint: IGraphAttachPoint;
    readonly changeIdFactory: IIdentifierFactory;

    getEntitiesInGroup<TGroupTraits>
    (
        group: IEntityGroup<unknown, TGroupTraits>,
    )
        : readonly TEntityTrait<unknown, TGroupTraits & TRequiredTraits>[];

    getInteractionHandler(): IPlotInteractionConnector<TPlotRange> | null;
    setInteractionHandler<TTarget extends object = IDefaultTargets>
    (
        interactionHandler: IPlotInteractionConnector<TPlotRange>,
        getTargetProviders: TGetChartEventTargetProviders<TTarget>,
        initialStateProvider: TInitialChartStateFactory<TPlotRange, TTarget>,
    )
        : IPlotEventTargetProvider<TTarget>;
    clearInteractionHandler(): void;
}

/**
 * @public
 * Mutative methods of a plot.
 */
export interface IWritablePlot<TRequiredTraits>
{
    setPlotArea(plotClipSpaceArea: IPlotArea): void;

    addEntity
    (
        entity: TUnknownEntity & TRequiredTraits,
    )
        : void;

    removeEntity
    (
        entity: TUnknownEntity,
    )
        : void;

    /**
     * For additional type safety, use the group's addToGroup method if present.
     *
     * @returns true if the entity was added to the group.
     */
    addToGroup<TUpdateArg, TOptions, TGroupTraits>
    (
        entity: TEntityTrait<TUpdateArg, TRequiredTraits> & TGroupTraits,
        group: IEntityGroup<TOptions, TGroupTraits>,
        options: TOptions,
    )
        : boolean;

    /**
     * @returns true if the entity was removed from the group.
     */
    removeFromGroup<TGroupTraits>
    (
        entity: TEntityTrait<unknown, TRequiredTraits> & TGroupTraits,
        group: IEntityGroup<unknown, TGroupTraits>,
    )
        : boolean;
}