import { IChartPointerEvent } from "../internal-events/chart-pointer-event";

/**
 * @public
 * Called before hit testing an entity, return false to prevent the entity from being included in the result.
 */
export interface IHitAllowedComponent<TUpdateArg, TTrait>
{
    isHitAllowed
    (
        entity: TTrait,
        pointerEvent: IChartPointerEvent<MouseEvent>,
        updateArg: TUpdateArg,
    )
        : boolean;
}
