import { TGl1EntityRenderer } from "./t-gl1-entity-renderer";
import { TGl2EntityRenderer } from "./t-gl2-entity-renderer";

/**
 * @public
 * Either a wgl1 renderer with extension `ANGLE_instanced_arrays` or wgl2 renderer.
 */
export type TGlInstancedEntityRenderer =
    | TGl1EntityRenderer<"ANGLE_instanced_arrays">
    | TGl2EntityRenderer
    ;
