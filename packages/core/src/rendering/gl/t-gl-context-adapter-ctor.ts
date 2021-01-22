import { IContextAdapter } from "../i-context-adapter";

/**
 * @public
 * Constructor signature for {@link Gl1ContextAdapter} or {@link Gl2ContextAdapter}.
 */
export type TGlContextAdapterCtor<TCtx> = new (canvas: HTMLCanvasElement, attributes?: WebGLContextAttributes) => IContextAdapter<TCtx>;