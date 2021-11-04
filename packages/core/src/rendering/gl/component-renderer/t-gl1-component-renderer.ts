import { TGlExtensionKeys } from "../i-gl-extensions";
import { TGlComponentRenderer } from "./gl-component-renderer";

/**
 * @public
 * Webgl1 renderer, without extensions by default.
 */
export type TGl1ComponentRenderer<TExts extends TGlExtensionKeys> =
    TGlComponentRenderer<WebGLRenderingContext, TExts>
    ;

