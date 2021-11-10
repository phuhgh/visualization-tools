import { GlContextAdapter } from "./gl-context-adapter";
import { IEventService } from "../../../eventing/event-service";

/**
 * @public
 * Webgl1 context adapter. Handles viewport and context loss.
 */
export class Gl1ContextAdapter extends GlContextAdapter<WebGLRenderingContext>
{
    public constructor
    (
        canvasElement: HTMLCanvasElement,
        eventService: IEventService,
        options?: WebGLContextAttributes,
    )
    {
        super(canvasElement, eventService, "webgl", options);
    }
}
