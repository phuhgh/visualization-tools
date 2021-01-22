import { IChartPointerEvent } from "../../eventing/user-interaction/internal-events/chart-pointer-event";
import { IHitTestableTrait } from "../groups/i-hit-testable-trait";
import { EEntityUpdateFlag } from "../../update/e-entity-update-flag";

/**
 * @public
 * An entity that may handle click events.
 */
export interface IClickableTrait extends IHitTestableTrait
{
    onClick?(pointerEvent: IChartPointerEvent<MouseEvent>, segmentIds: Set<number>): EEntityUpdateFlag;
    onDblClick?(pointerEvent: IChartPointerEvent<MouseEvent>, segmentIds: Set<number>): EEntityUpdateFlag;
}
