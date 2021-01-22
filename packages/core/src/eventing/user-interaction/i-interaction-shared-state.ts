import { IChartPointerEvent } from "./internal-events/chart-pointer-event";
import { HitTestResult } from "./hit-test/hit-test-result";
import { IHitTestableTrait } from "../../entities/groups/i-hit-testable-trait";

/**
 * @public
 */
export interface IInteractionSharedState
{
    dragTargets: readonly HitTestResult<unknown, IHitTestableTrait>[] | null;

    clearAllHoveredEntities(chartEvent: IChartPointerEvent<PointerEvent>): void;
    onHover(chartEvent: IChartPointerEvent<PointerEvent>): void;
    onClick(chartEvent: IChartPointerEvent<PointerEvent>): void;
    onDblClick(chartEvent: IChartPointerEvent<PointerEvent>): void;
}