/**
 * @public
 * Supported pointer events (both mouse and touch events).
 */
export enum EPointerEventType
{
    Move,
    Up,
    Down,
    Out,
}

/**
 * @internal
 */
export class EPointerEventTypeNames
{
    public static [EPointerEventType.Move] = "Mouse move";
    public static [EPointerEventType.Up] = "Mouse up";
    public static [EPointerEventType.Down] = "Mouse down";
    public static [EPointerEventType.Out] = "Mouse out";
}