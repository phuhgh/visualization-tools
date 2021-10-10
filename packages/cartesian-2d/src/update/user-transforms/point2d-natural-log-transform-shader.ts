import { GlShader } from "@visualization-tools/core";

/**
 * @internal
 */
// @formatter:off
// language=GLSL prefix="#if __VERSION__ >=300 && __VERSION__ < 400 \n #define ATTRIBUTE in \n #define VARYING out \n #else \n #define ATTRIBUTE attribute \n #define VARYING varying \n #endif"
export const point2dNaturalLogTransformShader = new GlShader(`
vec2 point2dNaturalLogTransform(vec2 point, vec2 transformConfig)
{
    return vec2(
        mix(point.x, log(point.x), transformConfig.x),
        mix(point.y, log(point.y), transformConfig.y)
    );
}
`);
// @formatter:on