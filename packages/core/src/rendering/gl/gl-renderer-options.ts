import { TGlExtensionKeys } from "./i-gl-extensions";
import { TGlFeatureFlags } from "./t-gl-feature-flags";
import { TGlBufferBitKeys } from "./t-gl-buffer-bit-keys";
import { TF32Vec4, Vec4 } from "rc-js-util";

/**
 * @public
 * WebGL on create options.
 */
export interface IGlRendererCreationOptions<TExts extends TGlExtensionKeys>
{
    featuresToEnable: TGlFeatureFlags[];
    requiredExtensionsToGet: TExts[];
    contextAttributes?: WebGLContextAttributes,
}

/**
 * @public
 * WebGl parameters to set before each frame.
 */
export interface IGlRendererOnFrameOptions
{
    bufferBitsToClear: TGlBufferBitKeys[];
    clearWithColor: TF32Vec4;
}

/**
 * @public
 * WebGl Renderer construction options.
 */
export interface IGlRendererOptions<TExts extends TGlExtensionKeys>
{
    /**
     * Options for enabling extensions and features, like SCISSOR_TEST etc.
     */
    onCreate: IGlRendererCreationOptions<TExts>;
    /**
     * Options for which bits should be cleared on a new frame and what color to clear with.
     */
    onNewFrame: IGlRendererOnFrameOptions;
}

/**
 * @public
 * {@inheritDoc IGlRendererOptions}
 */
export class GlRendererOptions<TExts extends TGlExtensionKeys> implements IGlRendererOptions<TExts>
{
    public onCreate: IGlRendererCreationOptions<TExts>;
    public onNewFrame: IGlRendererOnFrameOptions;

    public constructor
    (
        requiredExtensions: TExts[],
        attributes?: WebGLContextAttributes,
        featureFlags?: TGlFeatureFlags[],
    )
    {
        this.onCreate = {
            featuresToEnable: featureFlags ?? ["CULL_FACE", "DEPTH_TEST", "SCISSOR_TEST"],
            requiredExtensionsToGet: requiredExtensions,
            contextAttributes: attributes,
        };
        this.onNewFrame = {
            bufferBitsToClear: ["COLOR_BUFFER_BIT", "DEPTH_BUFFER_BIT"],
            clearWithColor: Vec4.f32.factory.createOne(0, 0, 0, 0),
        };
    }
}