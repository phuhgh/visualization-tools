import { GlShader } from "../gl-shader";

/**
 * @public
 * Component-wise mix on vec2.
 */
// language=GLSL
export const mixComponentsShader = new GlShader
(
    // @formatter:off
    `
#ifndef MIX_COMPONENTS

#define MIX_COMPONENTS 1

vec2 mixComponents(vec2 a, vec2 b, vec2 factor)
{
    return vec2(
    mix(a.x, b.x, factor.x),
    mix(a.y, b.y, factor.y)
    );
}

#endif
`,
    // @formatter:on
);