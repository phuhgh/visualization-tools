import { TGlExtensionKeys } from "../i-gl-extensions";
import { TGl2ComponentRenderer } from "./t-gl2-component-renderer";
import { TGl1ComponentRenderer } from "./t-gl1-component-renderer";

/**
 * @public
 * Either wgl1 or wgl2, without extensions by default.
 */
export type TGlBasicComponentRenderer<TExts extends TGlExtensionKeys = never> =
    | TGl1ComponentRenderer<TExts>
    | TGl2ComponentRenderer<TExts>
    ;