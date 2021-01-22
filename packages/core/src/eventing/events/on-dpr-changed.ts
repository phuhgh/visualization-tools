import { TListener } from "rc-js-util";
import { IEventService } from "../chart-event-service";

/**
 * @public
 * Device pixel ratio listener.
 */
export type TOnDprChanged = TListener<"onDprChanged", [dpr: number]>;

/**
 * @public
 * Event emitted on screen DPI changing, or when the user zooms the page (browser page scaling).
 */
export class OnDprChanged implements TOnDprChanged
{
    public static callbackKey = "onDprChanged" as const;

    public constructor
    (
        public onDprChanged: (dpr: number) => void,
    )
    {
    }

    public static registerListener
    (
        eventService: IEventService,
        onEvent: (dpr: number) => void,
    )
        : () => void
    {
        return eventService
            .getCategory(OnDprChanged)
            .addTemporaryListener(new OnDprChanged(onEvent));
    }

    public static emit
    (
        eventService: IEventService,
        dpr: number,
    )
        : void
    {
        const listeners = eventService
            .getCategory(OnDprChanged)
            .getTargets();

        for (let i = 0, iEnd = listeners.length; i < iEnd; ++i)
        {
            listeners[i].onDprChanged(dpr);
        }
    }
}
