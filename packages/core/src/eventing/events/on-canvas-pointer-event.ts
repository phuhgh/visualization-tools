import { EPointerEventType } from "../user-interaction/internal-events/e-pointer-event-type";
import { TListener } from "rc-js-util";
import { IEventService } from "../chart-event-service";

/**
 * @public
 * Mouse / touch event listener.
 */
export type TOnCanvasPointerEvent = TListener<"onPointerEvent", [eventType: EPointerEventType, $event: PointerEvent]>;

/**
 * @public
 * Provides raw pointer events. Shouldn't typically be used unless implementing custom interaction handler.
 */
export class OnCanvasPointerEvent implements TOnCanvasPointerEvent
{
    public static callbackKey = "onPointerEvent" as const;

    public constructor
    (
        public onPointerEvent: (eventType: EPointerEventType, $event: PointerEvent) => void,
    )
    {
    }

    public static registerListener
    (
        eventService: IEventService,
        onEvent: (eventType: EPointerEventType, $event: PointerEvent) => void,
    )
        : () => void
    {
        return eventService
            .getCategory(OnCanvasPointerEvent)
            .addTemporaryListener(new OnCanvasPointerEvent(onEvent));
    }

    public static emit
    (
        eventService: IEventService,
        eventType: EPointerEventType,
        $event: PointerEvent,
    )
        : void
    {
        const listeners = eventService
            .getCategory(OnCanvasPointerEvent)
            .getTargets();

        for (let i = 0, iEnd = listeners.length; i < iEnd; ++i)
        {
            listeners[i].onPointerEvent(eventType, $event);
        }
    }
}