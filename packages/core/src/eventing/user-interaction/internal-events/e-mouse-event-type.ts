/**
 * @public
 * Supported mouse event types, most events are handled through {@link EPointerEventType}.
 */
export enum EMouseEventType
{
    Wheel,
}

/**
 * @internal
 */
export class EMouseEventTypeNames
{
    public static [EMouseEventType.Wheel] = "Wheel";
}