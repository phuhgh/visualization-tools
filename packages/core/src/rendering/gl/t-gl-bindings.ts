import { IGlAttribute } from "./attributes/i-gl-attribute";
import { GlVec2Uniform } from "./uniforms/gl-vec2-uniform";
import { GlVec4Uniform } from "./uniforms/gl-vec4-uniform";
import { GlMat2Uniform } from "./uniforms/gl-mat2-uniform";
import { GlMat3Uniform } from "./uniforms/gl-mat3-uniform";
import { GlVec3Uniform } from "./uniforms/gl-vec3-uniform";
import { GlMat4Uniform } from "./uniforms/gl-mat4-uniform";

/**
 * @public
 * All supported attribute and uniform types.
 */
export type TGlBindings =
    | IGlAttribute
    | GlVec2Uniform
    | GlVec3Uniform
    | GlVec4Uniform
    | GlMat2Uniform
    | GlMat3Uniform
    | GlMat4Uniform
    ;