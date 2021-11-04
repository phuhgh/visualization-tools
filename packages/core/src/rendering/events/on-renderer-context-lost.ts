import { TListener } from "rc-js-util";
import { IEventService } from "../../eventing/event-service";

/**
 * @public
 * Listener for renderer context loss.
 */
export type TRendererOnContextLost = TListener<"onRendererContextLost", []>;

/**
 * @public
 * Emitted the renderer context is lost due to e.g. resource contention. Emitted on both chart and plots.
 */
export class OnRendererContextLost implements TRendererOnContextLost
{
    public static callbackKey = "onRendererContextLost" as const;

    public constructor
    (
        public onRendererContextLost: () => void,
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
            .getCategory<"onRendererContextLost", []>(OnRendererContextLost)
            .addTemporaryListener(new OnRendererContextLost(onEvent));
    }

    public static emit(eventService: IEventService): void
    {
        const listeners = eventService
            .getCategory(OnRendererContextLost)
            .getTargets();

        for (let i = 0, iEnd = listeners.length; i < iEnd; ++i)
        {
            listeners[i].onRendererContextLost();
        }
    }
}