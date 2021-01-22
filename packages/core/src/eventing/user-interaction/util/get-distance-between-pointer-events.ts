/**
 * In css pixels.
 */
export function getDistanceBetweenPointerEvents(firstEvent: PointerEvent, secondEvent: PointerEvent): number
{
    const adjacent = firstEvent.clientX - secondEvent.clientX;
    const opposite = firstEvent.clientY - secondEvent.clientY;

    return Math.hypot(adjacent, opposite);
}