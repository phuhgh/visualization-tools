import { IChartPointerEvent } from "./internal-events/chart-pointer-event";
import { HitTestResult } from "../hit-testing/hit-test-result";
import { IHitTestableTrait } from "../../entities/groups/i-hit-testable-trait";

/**
 * @public
 * Maps pointer events to entities.
 */
export interface IPointerEventHitTargetProvider<TUpdateArg, TTraits extends IHitTestableTrait>
{
    hitTestPlot(pointerEvent: IChartPointerEvent<MouseEvent>): HitTestResult<TUpdateArg, TTraits>[];
}