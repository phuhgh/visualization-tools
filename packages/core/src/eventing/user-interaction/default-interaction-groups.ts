import { IEntityUpdateArgProvider } from "../../entities/i-entity-update-arg-provider";
import { HitTestableGroup } from "../../entities/groups/hit-testable-group";
import { IWritablePlot } from "../../plot/i-plot";
import { IInteractionGroup, InteractionGroup } from "../../entities/groups/interaction-group";
import { IDraggableTrait } from "../../entities/traits/i-draggable-trait";
import { IHoverableTrait } from "../../entities/traits/i-hoverable-trait";
import { IClickableTrait } from "../../entities/traits/i-clickable-trait";
import { IPlotRange } from "../../plot/i-plot-range";

/**
 * @public
 * A set of interaction groups that should meet most use cases.
 */
export interface IDefaultInteractionGroups<TPlotRange extends IPlotRange, TUpdateArg, TStore>
{
    readonly hitTestable: HitTestableGroup<TPlotRange, TUpdateArg, TStore>;
    readonly draggable: IInteractionGroup<TUpdateArg, TStore, IDraggableTrait>;
    readonly clickable: IInteractionGroup<TUpdateArg, TStore, IClickableTrait>;
    readonly hoverable: IInteractionGroup<TUpdateArg, TStore, IHoverableTrait>;
}

/**
 * @public
 * {@inheritDoc IDefaultInteractionGroups}
 */
export class DefaultInteractionGroups<TPlotRange extends IPlotRange, TUpdateArg, TRequiredTraits, TStore>
    implements IDefaultInteractionGroups<TPlotRange, TUpdateArg, TStore>
{
    public readonly hitTestable: HitTestableGroup<TPlotRange, TUpdateArg, TStore>;
    public readonly draggable: IInteractionGroup<TUpdateArg, TStore, IDraggableTrait>;
    public readonly clickable: IInteractionGroup<TUpdateArg, TStore, IClickableTrait>;
    public readonly hoverable: IInteractionGroup<TUpdateArg, TStore, IHoverableTrait>;

    public constructor
    (
        argProvider: IEntityUpdateArgProvider<TPlotRange, TUpdateArg, TRequiredTraits>,
        plot: IWritablePlot<TRequiredTraits>,
    )
    {
        this.hitTestable = new HitTestableGroup(argProvider, plot);
        this.draggable = new InteractionGroup(1 << 0, this.hitTestable, plot);
        this.clickable = new InteractionGroup(1 << 1, this.hitTestable, plot);
        this.hoverable = new InteractionGroup(1 << 2, this.hitTestable, plot);
    }
}
