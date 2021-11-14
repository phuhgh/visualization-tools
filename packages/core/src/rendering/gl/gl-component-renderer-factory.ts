import { TGlContext } from "./t-gl-context";
import { IGlProgramSpec } from "./gl-program-specification";
import { GlComponentRenderer, TGlComponentRenderer, TGlExtensions } from "./component-renderer/gl-component-renderer";
import { _Array, _Debug, _Production } from "rc-js-util";
import { IGlExtensions, TGlExtensionKeys } from "./i-gl-extensions";
import { IComponentRendererFactory } from "../component-renderer/i-component-renderer-factory";
import { GlCompileError } from "../../errors/gl-compile-error";
import { IErrorLocalization } from "../../errors/i-error-localization";
import { developerErrorLocalization } from "../../errors/developer-error-localization";
import { IGlRendererSharedState } from "./gl-renderer-shared-state";
import { TExtractGcContext } from "../component-renderer/t-extract-gc-context";

/**
 * @public
 * Webgl component renderer factory.
 */
export class GlComponentRendererFactory<TComponentRenderer extends TGlComponentRenderer<TGlContext, never>>
    implements IComponentRendererFactory<IGlProgramSpec, TComponentRenderer>
{
    public static getExtensions<TCtx extends TGlContext, TExts extends TGlExtensionKeys>
    (
        context: TCtx | null,
        requiredExtensions: TExts[],
    )
        : TGlExtensions<TExts> | null
    {
        if (context == null)
        {
            return null;
        }

        const isGl2 = context instanceof WebGL2RenderingContext;
        const extensions = {} as IGlExtensions;

        for (let i = 0, iEnd = requiredExtensions.length; i < iEnd; ++i)
        {
            const name = requiredExtensions[i];
            const ext = context.getExtension(name);

            if (ext == null)
            {
                if (isGl2 && GlComponentRendererFactory.gl2StandardExtensions.has(name))
                {
                    continue;
                }

                throw _Production.createError(`extension "${name}" is required but not available`);
            }

            extensions[name] = ext;
        }

        return extensions;
    }

    public static createOne<TCtx extends TGlContext, TExts extends TGlExtensionKeys>
    (
        context: TCtx | null,
        extensions: TGlExtensions<TExts> | null,
        sharedState: IGlRendererSharedState | null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        localizations: IErrorLocalization<any> = developerErrorLocalization,
    )
        : GlComponentRendererFactory<TGlComponentRenderer<TCtx, TExts>> | null
    {
        if (context == null || extensions == null || sharedState == null)
        {
            return null;
        }

        return new GlComponentRendererFactory(context, localizations, sharedState, extensions);
    }

    public createRenderer
    (
        specification: IGlProgramSpec,
    )
        : TComponentRenderer
    {
        DEBUG_MODE && _Debug.assert(!this.context.isContextLost(), "tried to compile program during context loss");

        const program = this.compileProgram(
            specification.vertexShader.source,
            specification.fragmentShader.source,
            specification.outAttributes,
        );
        const optionalExts = _Array.collect(specification.optionalExtensions, {} as IGlExtensions, (extensions, name) =>
        {
            const ext = this.context.getExtension(name);

            if (ext != null)
            {
                extensions[name] = ext;
            }
        });

        return new GlComponentRenderer(
            this.context as TExtractGcContext<TComponentRenderer>,
            program,
            { ...this.extensions, ...optionalExts },
            specification,
            this.sharedState,
        ) as TGlComponentRenderer<TGlContext, never> as TComponentRenderer;
    }

    private compileProgram
    (
        vertexShaderSource: string,
        fragmentShaderSource: string,
        outAttributes: readonly string[] | null,
    )
        : WebGLProgram
    {
        const vertexShader = this.compileShader(this.context.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(this.context.FRAGMENT_SHADER, fragmentShaderSource);

        const program = this.context.createProgram();

        if (program == null)
        {
            throw _Production.createError("failed to create program");
        }

        this.context.attachShader(program, vertexShader);
        this.context.attachShader(program, fragmentShader);

        if (_Array.isNotEmpty(outAttributes) && this.context instanceof WebGL2RenderingContext)
        {
            // FIXME this should support interleaving as an option
            this.context.transformFeedbackVaryings(program, outAttributes as string[], this.context.SEPARATE_ATTRIBS);
        }

        this.context.linkProgram(program);

        if (this.context.getProgramParameter(program, this.context.LINK_STATUS) as GLboolean)
        {
            return program;
        }
        else
        {
            const causedBy = this.context.getProgramInfoLog(program);
            this.context.deleteProgram(program);

            throw new GlCompileError(this.localizations.glCompileError, causedBy, this.localizations.getTx);
        }
    }

    public setContext(context: TGlContext): void
    {
        this.context = context;
    }

    private compileShader(type: number, source: string): WebGLShader
    {
        const shader = this.context.createShader(type);

        if (shader == null)
        {
            throw _Production.createError(`failed to create shader of type ${type}`);
        }

        this.context.shaderSource(shader, source);
        this.context.compileShader(shader);
        const compiled = this.context.getShaderParameter(shader, this.context.COMPILE_STATUS) as GLboolean;

        DEBUG_MODE && _Debug.conditionalBlock("DEBUG_SHADER_COMPILATION", () =>
        {
            const ext = this.context.getExtension("WEBGL_debug_shaders");

            if (ext != null)
            {
                console.debug(ext.getTranslatedShaderSource(shader));
            }
        });

        if (!compiled)
        {
            const causedBy = this.context.getShaderInfoLog(shader);
            this.context.deleteShader(shader);

            throw new GlCompileError(this.localizations.glCompileError, causedBy, this.localizations.getTx);
        }
        else
        {
            return shader;
        }
    }

    protected constructor
    (
        private context: TGlContext,
        private localizations: IErrorLocalization<unknown>,
        private readonly sharedState: IGlRendererSharedState,
        private readonly extensions: TGlExtensions<never>,
    )
    {
    }

    private static gl2StandardExtensions = new Set<TGlExtensionKeys>([
        "ANGLE_instanced_arrays",
        "OES_vertex_array_object",
        "WEBGL_depth_texture",
        "OES_texture_float",
        "OES_texture_float_linear",
        "OES_texture_half_float",
        "OES_texture_half_float_linear",
        "OES_standard_derivatives",
        "OES_element_index_uint",
        "EXT_frag_depth",
        "EXT_blend_minmax",
        "EXT_shader_texture_lod",
        "WEBGL_draw_buffers",
        "EXT_sRGB",
    ]);
}
