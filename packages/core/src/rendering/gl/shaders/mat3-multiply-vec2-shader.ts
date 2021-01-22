import { GlShader } from "../gl-shader";

/**
 * @public
 * Pad vec2 up with additional 1 and multiply.
 */
// language=GLSL
export const mat3MultiplyVec2Shader = new GlShader
(
    // @formatter:off
    `
#ifndef GET_MAT3_MULTIPLY_VEC2

#define GET_MAT3_MULTIPLY_VEC2 1

vec2 mat3MultiplyVec2(mat3 transform, vec2 coords)
{
    return (transform * vec3(coords, 1)).xy;
}

#endif
`,
    // @formatter:on
);