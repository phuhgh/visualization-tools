import { GlShader } from "../gl-shader";

/**
 * @public
 * Pad float up to vec2 up with additional 1 and multiply.
 */
// language=GLSL
export const mat2MultiplyValueShader = new GlShader
(
    // @formatter:off
    `
#ifndef GET_MAT2_MULTIPLY_VALUE

#define GET_MAT2_MULTIPLY_VALUE 1

float mat2MultiplyValue(mat2 transform, float value)
{
    return (transform * vec2(value, 1)).x;
}

#endif
`,
    // @formatter:on
);