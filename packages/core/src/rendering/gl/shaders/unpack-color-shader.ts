import { ERgbaShift } from "rc-js-util";
import { GlShader } from "../gl-shader";

/**
 * @public
 * Takes a float32 which is used to store a packed int24 storing RGB.
 */
export const unpackColorShader = new GlShader
(
    // @formatter:off
    // language=GLSL
    `
#ifndef FLOAT_COLOR_PACKER

#define FLOAT_COLOR_PACKER 1

/* === color unpacker (float) === */
const highp int ERgbaShift_R = ${ERgbaShift.R};
const highp int ERgbaShift_G = ${ERgbaShift.G};
const highp int ERgbaShift_B = ${ERgbaShift.B};

const highp int ERgbaMasks_R = 0xFF << ERgbaShift_R;
const highp int ERgbaMasks_G = 0xFF << ERgbaShift_G;
const highp int ERgbaMasks_B = 0xFF << ERgbaShift_B;

mediump vec4 unpackColor(highp float packedColor)
{
    highp int tmp = int(packedColor);
    const highp float sf = 1./255.;

    return vec4(
        float(((tmp & ERgbaMasks_R) >> ERgbaShift_R) & 0xFF) * sf,
        float(((tmp & ERgbaMasks_G) >> ERgbaShift_G) & 0xFF) * sf,
        float(((tmp & ERgbaMasks_B) >> ERgbaShift_B) & 0xFF) * sf,
        1.
    );
}

#endif
`,
    // @formatter:on
    300,
);