import { _Math } from "rc-js-util";

/**
 * In css pixels.
 */
export function getDistanceBetweenPointerEvents(firstEvent: PointerEvent, secondEvent: PointerEvent): number
{
    const adjacent = firstEvent.clientX - secondEvent.clientX;
    const opposite = firstEvent.clientY - secondEvent.clientY;

    return _Math.hypot2(adjacent, opposite);
}