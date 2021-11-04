import { IChartPointerEvent } from "../../eventing/user-interaction/internal-events/chart-pointer-event";
import { IHitTestableTrait } from "../groups/i-hit-testable-trait";
import { EEntityUpdateFlag } from "../../update/e-entity-update-flag";

/**
 * @public
 * State changes of {@link IHoverableTrait}.
 * Events are emitted to entities in the order listed in the enum.
 */
export enum EHoverState
{
    Left = 1,
    /**
     * Required where entities share state, otherwise a Left state would clear the hovered state.
     */
    Unchanged,
    SegmentChange,
    Entered,
}

/**
 * @public
 * An entity that may handle hover events.
 */
export interface IHoverableTrait extends IHitTestableTrait
{
    onHover?(state: EHoverState, segments: ReadonlySet<number>, pointerEvent: IChartPointerEvent<MouseEvent>): EEntityUpdateFlag;
}