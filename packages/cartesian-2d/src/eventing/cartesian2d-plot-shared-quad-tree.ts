import { IEmscriptenWrapper, TemporaryListener, TTypedArray } from "rc-js-util";
import { ICartesian2dPlotRange } from "../update/update-arg/cartesian2d-plot-range";
import { ICartesian2dUpdateArg } from "../update/update-arg/cartesian2d-update-arg";
import { ICartesian2dPlot } from "../plot/i-cartesian2d-plot";
import { Cartesian2dInteractionHandler } from "./cartesian2d-interaction-handler";
import { DefaultInteractionGroups, getChartInitialState, IChartComponent, IDefaultInteractionGroups, IHitTestableTrait, IInteractionStateChangeCallbacks, IQuadTreeTargetOptions, ISharedEntityQuadTree, ISharedQuadTreeBindings, OnEntityAddedToGroup, OnEntityRemoved, OnEntityRemovedFromGroup, OnPlotAttachChanged, PlotInteractionConnector, QuadTreeEventTargetProvider, SharedEntityQuadTree, TUnknownComponentRenderer, TUnknownRenderer } from "@visualization-tools/core";

/**
 * @public
 */
export type TCartesianSharedQuadTree<TArray extends TTypedArray> = ISharedEntityQuadTree<ICartesian2dUpdateArg<TArray>, IHitTestableTrait>;

/**
 * @public
 * Default interaction groups for cartesian 2d.
 */
export type TCartesianSharedQuadTreeGroup<TArray extends TTypedArray> =
    IDefaultInteractionGroups<ICartesian2dPlotRange<TArray>, ICartesian2dUpdateArg<TArray>, TCartesianSharedQuadTree<TArray>>
    ;

/**
 * @public
 * Default interaction groups implemented using a shared quad tree.
 */
export class Cartesian2dPlotSharedQuadTree<TArray extends TTypedArray, TRequiredTraits>
{
    public interactionGroups: TCartesianSharedQuadTreeGroup<TArray>;

    public constructor
    (
        private readonly plot: ICartesian2dPlot<TUnknownComponentRenderer, TArray, TRequiredTraits>,
        private readonly options: IQuadTreeTargetOptions,
    )
    {
        this.interactionGroups = new DefaultInteractionGroups(plot.updateArgProvider, plot);
    }

    public setQuadTreeInteractionHandler
    (
        emscriptenWrapper: IEmscriptenWrapper<ISharedQuadTreeBindings>,
        chart: IChartComponent<TUnknownRenderer>,
        listeners: Partial<IInteractionStateChangeCallbacks<IHitTestableTrait & TRequiredTraits>> = {},
    )
        : void
    {
        const entityTree = new SharedEntityQuadTree<unknown, IHitTestableTrait>(emscriptenWrapper, 12, 4);
        this.populateTree(entityTree);
        this.configureListeners(entityTree);

        this.plot.setInteractionHandler(
            new PlotInteractionConnector(
                () =>
                {
                    return new Cartesian2dInteractionHandler(chart, this.plot, listeners);
                }),
            () => new QuadTreeEventTargetProvider(entityTree, this.plot, this.interactionGroups, this.options),
            getChartInitialState,
        );
    }

    public clearInteractionHandler(): void
    {
        this.plot.clearInteractionHandler();
    }

    private populateTree
    (
        entityTree: SharedEntityQuadTree<unknown, IHitTestableTrait>,
    )
        : void
    {
        const existingEntities = this.plot.getEntitiesInGroup(this.interactionGroups.hitTestable);

        for (let i = 0, iEnd = existingEntities.length; i < iEnd; ++i)
        {
            entityTree.addEntity(existingEntities[i]);
        }
    }

    private configureListeners
    (
        entityTree: SharedEntityQuadTree<unknown, IHitTestableTrait>,
    )
        : void
    {
        OnPlotAttachChanged.registerOneTimeListener(this.plot, (isAttached) =>
        {
            if (!isAttached)
            {
                entityTree.sharedObject.release();
                this.temporaryListeners.clearListeners();
            }
        });

        this.temporaryListeners.addListener(OnEntityAddedToGroup.registerListener(this.plot, (entity) =>
        {
            if (this.interactionGroups.hitTestable.isEntityInGroup(entity))
            {
                entityTree.addEntity(entity);
            }
        }));

        this.temporaryListeners.addListener(OnEntityRemovedFromGroup.registerListener(this.plot, (entity) =>
        {
            if (this.interactionGroups.hitTestable.isEntityInGroup(entity))
            {
                entityTree.removeEntity(entity);
            }
        }));
        this.temporaryListeners.addListener(OnEntityRemoved.registerListener(this.plot, (entity) =>
        {
            if (this.interactionGroups.hitTestable.isEntityInGroup(entity))
            {
                entityTree.removeEntity(entity);
            }
        }));
    }

    private temporaryListeners = new TemporaryListener<[]>();
}