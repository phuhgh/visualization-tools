import { TGl1ComponentRenderer } from "./t-gl1-component-renderer";
import { TGl2ComponentRenderer } from "./t-gl2-component-renderer";

/**
 * @public
 * Either a wgl1 renderer with extension `ANGLE_instanced_arrays` or wgl2 renderer.
 */
export type TGlInstancedComponentRenderer =
    | TGl1ComponentRenderer<"ANGLE_instanced_arrays">
    | TGl2ComponentRenderer
    ;
