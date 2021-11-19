import { AEntityGroup, IEntityGroup } from "./a-entity-group";
import { HitTestableGroup, IHitTestableGroupOptions } from "./hit-testable-group";
import { EntityComponentStore, IEntityComponentStore } from "../entity-component-store";
import { TEntityTrait } from "../traits/t-entity-trait";
import { IHitAllowedComponent } from "../../eventing/hit-testing/i-hit-allowed-component";
import { IWritablePlot } from "../../plot/i-plot";
import { IHitTestableTrait } from "./i-hit-testable-trait";
import { IPlotRange } from "../../plot/i-plot-range";

/**
 * @public
 * Entities in this group have the same requirements as {@link IHitTestableGroup}. Allows up to 32 `IInteractionGroup`s
 * per plot for click / hover handlers etc.
 *
 * @remarks
 * `IInteractionGroup`s should share `IHitTestableGroup`s to avoid duplicate work. Each entity is allowed a single {@link IHitTestableGroup}
 * shared between all `IInteractionGroup`s but may have a unique {@link IHitAllowedComponent} per group.
 */
export interface IInteractionGroup<TUpdateArg, TStore, TTraits extends IHitTestableTrait>
    extends IEntityGroup<IHitTestableGroupOptions<TUpdateArg, TTraits, TStore>, IHitTestableTrait>
{
    hitTestableGroup: HitTestableGroup<IPlotRange, TUpdateArg, TStore>;
    /**
     * Must be unique to identify the group.
     */
    groupMask: number;
    hitAllowedComponentStore: IEntityComponentStore<TEntityTrait<TUpdateArg, IHitTestableTrait>, IHitAllowedComponent<TUpdateArg, IHitTestableTrait>>;

    /**
     * Use this over addToGroup on plot to get better typing.
     */
    addToGroup<TComponentTraits extends TTraits>
    (
        entity: TEntityTrait<TUpdateArg, IHitTestableTrait & TComponentTraits>,
        options: IHitTestableGroupOptions<TUpdateArg, TComponentTraits, TStore>,
    )
        : void;
}

/**
 * @public
 * {@inheritDoc IInteractionGroup}
 */
export class InteractionGroup<TUpdateArg, TStore, TTraits extends IHitTestableTrait>
    extends AEntityGroup<IHitTestableGroupOptions<TUpdateArg, TTraits, TStore>, IHitTestableTrait>
    implements IInteractionGroup<TUpdateArg, TStore, TTraits>
{
    public groupMask: number;
    public hitAllowedComponentStore: IEntityComponentStore<TEntityTrait<TUpdateArg, IHitTestableTrait>, IHitAllowedComponent<TUpdateArg, IHitTestableTrait>>;
    public hitTestableGroup: HitTestableGroup<IPlotRange, TUpdateArg, TStore>;

    public constructor
    (
        groupMask: number,
        hitTestableGroup: HitTestableGroup<IPlotRange, TUpdateArg, TStore>,
        private plot: IWritablePlot<unknown>,
    )
    {
        super();
        this.hitAllowedComponentStore = new EntityComponentStore();
        this.groupMask = groupMask;
        this.hitTestableGroup = hitTestableGroup;
    }

    public addToGroup<TComponentTraits extends TTraits>
    (
        entity: TEntityTrait<TUpdateArg, IHitTestableTrait & TComponentTraits>,
        options: IHitTestableGroupOptions<TUpdateArg, TComponentTraits, TStore>,
    )
        : void
    {
        this.plot.addToGroup(entity, this, options);
    }

    public onEntityAdded
    (
        entity: TEntityTrait<TUpdateArg, IHitTestableTrait>,
        options: IHitTestableGroupOptions<TUpdateArg, IHitTestableTrait, TStore>,
    )
        : void
    {
        this.hitTestableGroup.refCountingAddEntity(entity, options);
        this.hitAllowedComponentStore.setComponent(entity, options.hitAllowedComponent);
        entity.groupMask |= this.groupMask;
        this.entitiesInGroup.add(entity);
    }

    public onEntityRemoved(entity: TEntityTrait<TUpdateArg, IHitTestableTrait>): void
    {
        // remove the mask without touching the others
        entity.groupMask &= ~this.groupMask;
        this.entitiesInGroup.delete(entity);
        this.hitTestableGroup.refCountingRemoveEntity(entity);
        this.hitAllowedComponentStore.deleteComponent(entity);
    }

    protected entitiesInGroup: Set<TEntityTrait<TUpdateArg, IHitTestableTrait>> = new Set();
}
