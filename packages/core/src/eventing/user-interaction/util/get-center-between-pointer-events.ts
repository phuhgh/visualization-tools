import { TF32Vec2, Vec2 } from "rc-js-util";
import { IChartPointerEvent } from "../internal-events/chart-pointer-event";

/**
 * In css pixels.
 */
export function getCenterBetweenPointerEvents
(
    firstEvent: IChartPointerEvent<PointerEvent>,
    secondEvent: IChartPointerEvent<PointerEvent>,
    result: TF32Vec2 = new Vec2.f32(),
)
    : TF32Vec2
{
    firstEvent.pointerCssPosition
        .add(secondEvent.pointerCssPosition, result)
        .scalarMultiply(0.5, result);

    return result;
}