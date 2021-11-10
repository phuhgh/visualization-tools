import { IContextAdapter } from "../i-context-adapter";
import { IEventService } from "../../eventing/event-service";

/**
 * @public
 * Constructor signature for {@link Gl1ContextAdapter} or {@link Gl2ContextAdapter}.
 */
export type TGlContextAdapterCtor<TCtx> = new
(
    canvas: HTMLCanvasElement,
    eventService: IEventService,
    attributes?: WebGLContextAttributes,
)
    => IContextAdapter<TCtx>;