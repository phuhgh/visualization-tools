import { GlShader } from "../rendering/gl/gl-shader";

/**
 * @internal
 */
// language=GLSL prefix="#if __VERSION__ >=300 && __VERSION__ < 400 \n #define VARYING in \n #define TEXTURE2D texture \n #else \n #define VARYING varying \n #define TEXTURE2D texture2D \n #endif \n void setFragmentColor(in lowp vec4 color);"
export const debugFragmentShader = new GlShader(`
VARYING lowp vec4 test_color;

void main()
{
    setFragmentColor(test_color);
}
`);