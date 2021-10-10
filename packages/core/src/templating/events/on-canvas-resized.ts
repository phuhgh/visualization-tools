import { ICanvasDimensions } from "../canvas-dimensions";
import { TListener } from "rc-js-util";
import { IEventService } from "../../eventing/event-service";

/**
 * @public
 * Resize listener, event emitted on {@link IChartComponent.resize} call.
 */
export type TOnCanvasResized = TListener<"onCanvasResized", [canvasDims: ICanvasDimensions]>;

/**
 * @public
 * Provides events for chart resizing, emitted on {@link IChartComponent.resize} call.
 */
export class OnCanvasResized implements TOnCanvasResized
{
    public static callbackKey = "onCanvasResized" as const;

    public constructor
    (
        public onCanvasResized: (canvasDims: ICanvasDimensions) => void,
    )
    {
    }

    public static registerListener
    (
        eventService: IEventService,
        onEvent: (canvasDims: ICanvasDimensions) => void,
    )
        : () => void
    {
        return eventService
            .getCategory(OnCanvasResized)
            .addTemporaryListener(new OnCanvasResized(onEvent));
    }

    public static emit
    (
        eventService: IEventService,
        canvasDims: ICanvasDimensions,
    )
        : void
    {
        const listeners = eventService
            .getCategory(OnCanvasResized)
            .getTargets();

        for (let i = 0, iEnd = listeners.length; i < iEnd; ++i)
        {
            listeners[i].onCanvasResized(canvasDims);
        }
    }
}
