import { GlContextAdapter } from "./gl-context-adapter";
import { IEventService } from "../../../eventing/event-service";

/**
 * @public
 * Webgl2 context adapter. Handles viewport and context loss.
 */
export class Gl2ContextAdapter extends GlContextAdapter<WebGL2RenderingContext>
{
    public constructor
    (
        canvasElement: HTMLCanvasElement,
        eventService: IEventService,
        options?: WebGLContextAttributes,
    )
    {
        super(canvasElement, eventService, "webgl2", options);
    }
}
