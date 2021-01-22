import { TGlExtensionKeys } from "../i-gl-extensions";
import { TGlEntityRenderer } from "./gl-entity-renderer";

/**
 * @public
 * Webgl1 renderer, without extensions by default.
 */
export type TGl1EntityRenderer<TExts extends TGlExtensionKeys> =
    TGlEntityRenderer<WebGLRenderingContext, TExts>
    ;

