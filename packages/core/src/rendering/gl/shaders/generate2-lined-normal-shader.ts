import { GlShader } from "../gl-shader";

/**
 * @public
 * Generates normal to a line. If the points `a` & `b` are the same it instead
 * returns `fallback`.
 */
export const generate2LinedNormalShader = new GlShader(
    // @formatter:off
    // language=GLSL
    `
#ifndef NORMAL_2D_GENERATOR

#define NORMAL_2D_GENERATOR 1
/* === normal generator === */
vec2 generate2dLineNormal(in vec2 a, in vec2 b, in vec2 fallback)
{
    vec2 difference = b - a;
    vec2 absoluteDifference = abs(difference);
    float isNonZero = sign(absoluteDifference.x + absoluteDifference.y);
    difference = mix(fallback, difference, isNonZero);

    return normalize(vec2(difference.y, -difference.x));
}

#endif
`,
    // @formatter:on
);
