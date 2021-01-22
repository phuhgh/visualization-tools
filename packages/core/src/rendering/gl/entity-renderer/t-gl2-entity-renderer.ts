import { TGlExtensionKeys } from "../i-gl-extensions";
import { TGlEntityRenderer } from "./gl-entity-renderer";

/**
 * @public
 * Webgl2 renderer, without extensions by default.
 */
export type TGl2EntityRenderer<TExts extends TGlExtensionKeys = never> =
    TGlEntityRenderer<WebGL2RenderingContext, TExts>
    ;