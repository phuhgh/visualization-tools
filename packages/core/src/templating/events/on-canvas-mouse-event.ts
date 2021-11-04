import { EMouseEventType } from "../../eventing/user-interaction/internal-events/e-mouse-event-type";
import { TListener } from "rc-js-util";
import { IEventService } from "../../eventing/event-service";

/**
 * @public
 * Mouse event listener.
 */
export type TOnCanvasMouseEvent = TListener<"onMouseEvent", [eventType: EMouseEventType, $event: MouseEvent]>;

/**
 * @public
 * Provides raw mouse events. Shouldn't typically be used unless implementing custom interaction handler.
 */
export class OnCanvasMouseEvent implements TOnCanvasMouseEvent
{
    public static callbackKey = "onMouseEvent" as const;

    public constructor
    (
        public onMouseEvent: (eventType: EMouseEventType, $event: MouseEvent) => void,
    )
    {
    }

    public static registerListener
    (
        eventService: IEventService,
        onEvent: (eventType: EMouseEventType, $event: MouseEvent) => void,
    )
        : () => void
    {
        return eventService
            .getCategory(OnCanvasMouseEvent)
            .addTemporaryListener(new OnCanvasMouseEvent(onEvent));
    }

    public static emit
    (
        eventService: IEventService,
        eventType: EMouseEventType,
        $event: MouseEvent,
    )
        : void
    {
        const listeners = eventService
            .getCategory(OnCanvasMouseEvent)
            .getTargets();

        for (let i = 0, iEnd = listeners.length; i < iEnd; ++i)
        {
            listeners[i].onMouseEvent(eventType, $event);
        }
    }
}