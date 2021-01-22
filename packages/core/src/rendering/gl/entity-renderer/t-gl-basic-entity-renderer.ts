import { TGlExtensionKeys } from "../i-gl-extensions";
import { TGl2EntityRenderer } from "./t-gl2-entity-renderer";
import { TGl1EntityRenderer } from "./t-gl1-entity-renderer";

/**
 * @public
 * Either wgl1 or wgl2, without extensions by default.
 */
export type TGlBasicEntityRenderer<TExts extends TGlExtensionKeys = never> =
    | TGl1EntityRenderer<TExts>
    | TGl2EntityRenderer<TExts>
    ;