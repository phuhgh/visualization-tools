import { IChartPointerEvent } from "../../eventing/user-interaction/internal-events/chart-pointer-event";
import { IHitTestableTrait } from "../groups/i-hit-testable-trait";
import { EEntityUpdateFlag } from "../../update/e-entity-update-flag";

/**
 * @public
 * State changes of {@link IHoverableTrait}.
 */
export enum EHoverState
{
    Left = 1,
    SegmentChange,
    Entered,
}

/**
 * @public
 * An entity that may handle hover events.
 */
export interface IHoverableTrait extends IHitTestableTrait
{
    onHoverChange?(state: EHoverState, segments: ReadonlySet<number>, pointerEvent: IChartPointerEvent<MouseEvent>): EEntityUpdateFlag;
}