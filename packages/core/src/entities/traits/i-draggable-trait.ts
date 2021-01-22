import { IChartPointerEvent } from "../../eventing/user-interaction/internal-events/chart-pointer-event";
import { IHitTestableTrait } from "../groups/i-hit-testable-trait";

/**
 * @public
 * An entity that may handle hover events. Unlike other interaction traits, if a redraw is required this must be done through
 * the plot wide interaction handler.
 */
export interface IDraggableTrait extends IHitTestableTrait
{
    /**
     * Return `true` to indicate that the entity may be dragged.
     */
    onDragStart?(pointerEvent: IChartPointerEvent<MouseEvent>, segmentIds: Set<number>): boolean;
    onDragEnd?(pointerEvent: IChartPointerEvent<MouseEvent>, segmentIds: Set<number>): void;
}
