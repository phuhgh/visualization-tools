import { IPointerEventHitTargetProvider } from "./i-pointer-event-hit-target-provider";
import { IHitTestableTrait } from "../../../entities/groups/i-hit-testable-trait";

/**
 * @public
 * The default target providers for user interactions.
 */
export interface IDefaultTargets
{
    clickTargetProvider: IPointerEventHitTargetProvider<unknown, IHitTestableTrait>;
    dragTargetProvider: IPointerEventHitTargetProvider<unknown, IHitTestableTrait>;
    hoverTargetProvider: IPointerEventHitTargetProvider<unknown, IHitTestableTrait>;
}