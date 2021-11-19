import { AEntityGroup, IReadonlyEntityGroup } from "./a-entity-group";
import { TEntityTrait } from "../traits/t-entity-trait";
import { IEntityUpdateArgProvider } from "../i-entity-update-arg-provider";
import { _Debug, _Map, DirtyCheckedUniqueCollection, IDirtyCheckedUniqueCollection } from "rc-js-util";
import { IHitAllowedComponent } from "../../eventing/hit-testing/i-hit-allowed-component";
import { IHitTestComponent } from "../../eventing/hit-testing/i-hit-test-component";
import { IWritablePlot } from "../../plot/i-plot";
import { IHitTestableTrait } from "./i-hit-testable-trait";
import { IPlotRange } from "../../plot/i-plot-range";

/**
 * @public
 */
export type TEntitiesByHitTester<TUpdateArg, TComponentState> = readonly [
    IHitTestComponent<TUpdateArg, IHitTestableTrait, TComponentState>,
    readonly TEntityTrait<TUpdateArg, IHitTestableTrait>[],
];

/**
 * @public
 */
export interface IHitTestableGroupOptions<TUpdateArg, TTraits extends IHitTestableTrait, TStore>
{
    hitAllowedComponent: IHitAllowedComponent<TUpdateArg, TTraits>;
    hitTestComponent: IHitTestComponent<TUpdateArg, TTraits, TStore>;
}

/**
 * @public
 * Entities in this group must implement {@link IHitTestableTrait} and have an associated {@link IHitAllowedComponent}
 * and {@link IHitTestComponent} which can be accessed through the group. Hit test composition is not currently supported.
 *
 * @remarks
 * May be shared by multiple interaction groups, entities should not be added to this group through the plot, this is done by
 * the interaction group. When implementing an interaction group these should use the reference counting methods
 * `refCountingAddEntity` and `refCountingRemoveEntity`.
 */
export interface IHitTestableGroup<TPlotRange  extends IPlotRange, TUpdateArg, TComponentState>
    extends IReadonlyEntityGroup<IHitTestableTrait>
{
    argProvider: IEntityUpdateArgProvider<TPlotRange, TUpdateArg, unknown>;
    getHitTester(entity: TEntityTrait<TUpdateArg, IHitTestableTrait>): IHitTestComponent<TUpdateArg, IHitTestableTrait, TComponentState>;
    getEntitiesByHitTester(): TEntitiesByHitTester<TUpdateArg, TComponentState>[];

    refCountingAddEntity
    (
        entity: TEntityTrait<TUpdateArg, IHitTestableTrait>,
        options: IHitTestableGroupOptions<TUpdateArg, IHitTestableTrait, TComponentState>,
    )
        : void;

    refCountingRemoveEntity
    (
        entity: TEntityTrait<TUpdateArg, IHitTestableTrait>,
    )
        : void;
}

/**
 * @public
 * {@inheritDoc IHitTestableGroup}
 */
export class HitTestableGroup<TPlotRange extends IPlotRange, TUpdateArg, TComponentState>
    extends AEntityGroup<IHitTestableGroupOptions<TUpdateArg, IHitTestableTrait, TComponentState>, IHitTestableTrait>
    implements IHitTestableGroup<TPlotRange, TUpdateArg, TComponentState>
{
    public constructor
    (
        public readonly argProvider: IEntityUpdateArgProvider<TPlotRange, TUpdateArg, unknown>,
        private readonly plot: IWritablePlot<unknown>,
    )
    {
        super();
    }

    public getHitTester
    (
        entity: TEntityTrait<TUpdateArg, IHitTestableTrait>,
    )
        : IHitTestComponent<TUpdateArg, IHitTestableTrait, TComponentState>
    {
        DEBUG_MODE && _Debug.assert(this.hitTesterByEntity.has(entity), "expected to find hit test component");
        return this.hitTesterByEntity.get(entity) as IHitTestComponent<TUpdateArg, IHitTestableTrait, TComponentState>;
    }

    public getEntitiesByHitTester(): TEntitiesByHitTester<TUpdateArg, TComponentState>[]
    {
        if (this.isDirty)
        {
            this.isDirty = false;
            return this.cache = _Map.arrayMap(this.entitiesByHitTester, (entities, hitTester) =>
            {
                return [hitTester, entities.getArray()];
            });
        }
        else
        {
            return this.cache;
        }
    }

    public refCountingAddEntity
    (
        entity: TEntityTrait<TUpdateArg, IHitTestableTrait>,
        options: IHitTestableGroupOptions<TUpdateArg, IHitTestableTrait, TComponentState>,
    )
        : void
    {
        const count = 1 + (this.referenceCounts.get(entity) ?? 0);
        this.referenceCounts.set(entity, count);

        if (count > 1)
        {
            DEBUG_MODE && _Debug.assert(this.hitTesterByEntity.get(entity) === options.hitTestComponent, "attempted to set a different hit test component to one previous set");
            return;
        }

        this.plot.addToGroup(entity, this, options);
    }

    public refCountingRemoveEntity
    (
        entity: TEntityTrait<TUpdateArg, IHitTestableTrait>,
    )
        : void
    {
        const count = this.referenceCounts.get(entity) ?? 0;

        // decrementing will result in empty
        if (count === 1)
        {
            this.plot.removeFromGroup(entity, this);
            this.referenceCounts.delete(entity);
        }
        else
        {
            this.referenceCounts.set(entity, count - 1);
        }
    }

    public onEntityAdded
    (
        entity: TEntityTrait<TUpdateArg, IHitTestableTrait>,
        options: IHitTestableGroupOptions<TUpdateArg, IHitTestableTrait, TComponentState>,
    )
        : void
    {
        DirtyCheckedUniqueCollection.mapInitializeAdd(this.entitiesByHitTester, options.hitTestComponent, entity);
        this.hitTesterByEntity.set(entity, options.hitTestComponent);
        this.entitiesInGroup.add(entity);
        this.isDirty = true;
    }

    public onEntityRemoved(entity: TEntityTrait<TUpdateArg, IHitTestableTrait>): void
    {
        const hitTesters = this.hitTesterByEntity.get(entity);

        if (hitTesters != null)
        {
            this.hitTesterByEntity.delete(entity);
            _Map.clearingDeleteFromSet(this.entitiesByHitTester, hitTesters, entity);
            this.entitiesInGroup.delete(entity);
            this.isDirty = true;
        }
    }

    private entitiesByHitTester = new Map<IHitTestComponent<TUpdateArg, IHitTestableTrait, TComponentState>, IDirtyCheckedUniqueCollection<TEntityTrait<TUpdateArg, IHitTestableTrait>>>();
    private hitTesterByEntity = new WeakMap<TEntityTrait<TUpdateArg, IHitTestableTrait>, IHitTestComponent<TUpdateArg, IHitTestableTrait, TComponentState>>();
    private referenceCounts = new WeakMap<TEntityTrait<TUpdateArg, IHitTestableTrait>, number>();
    private isDirty = true;
    protected entitiesInGroup: Set<TEntityTrait<TUpdateArg, IHitTestableTrait>> = new Set();
    private cache: TEntitiesByHitTester<TUpdateArg, TComponentState>[] = [];
}