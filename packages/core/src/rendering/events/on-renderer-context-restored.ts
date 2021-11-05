import { TListener } from "rc-js-util";
import { IEventService } from "../../eventing/event-service";

/**
 * @public
 * Listener for renderer context restoration.
 */
export type TRendererOnContextRestored = TListener<"onRendererContextRestored", []>;

/**
 * @public
 * Emitted when the renderer context is restored. Emitted on both chart and plots.
 */
export class OnRendererContextRestored implements TRendererOnContextRestored
{
    public static callbackKey = "onRendererContextRestored" as const;

    public constructor
    (
        public onRendererContextRestored: () => void,
    )
    {
    }

    public static registerListener
    (
        chartEventService: IEventService,
        onEvent: () => void,
    )
        : () => void
    {
        return chartEventService
            .getCategory<"onRendererContextRestored", []>(OnRendererContextRestored)
            .addTemporaryListener(new OnRendererContextRestored(onEvent));
    }

    public static emit(eventService: IEventService): void
    {
        const listeners = eventService
            .getCategory(OnRendererContextRestored)
            .getTargets();

        for (let i = 0, iEnd = listeners.length; i < iEnd; ++i)
        {
            listeners[i].onRendererContextRestored();
        }
    }
}