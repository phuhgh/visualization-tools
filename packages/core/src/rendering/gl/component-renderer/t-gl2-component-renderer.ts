import { TGlExtensionKeys } from "../i-gl-extensions";
import { TGlComponentRenderer } from "./gl-component-renderer";

/**
 * @public
 * Webgl2 renderer, without extensions by default.
 */
export type TGl2ComponentRenderer<TExts extends TGlExtensionKeys = never> =
    TGlComponentRenderer<WebGL2RenderingContext, TExts>
    ;