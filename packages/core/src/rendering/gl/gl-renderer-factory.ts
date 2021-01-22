import { TGlContext } from "./t-gl-context";
import { IGlProgramSpec } from "./gl-program-specification";
import { GlEntityRenderer, TGlEntityRenderer, TGlExtensions } from "./entity-renderer/gl-entity-renderer";
import { _Array, _Debug, _Production, TUnpackArray } from "rc-js-util";
import { TGlExtensionKeys } from "./i-gl-extensions";
import { IEntityRendererFactory } from "../i-entity-renderer-factory";
import { GlCompileError } from "../../errors/gl-compile-error";
import { IErrorLocalization } from "../../errors/i-error-localization";
import { developerErrorLocalization } from "../../errors/developer-error-localization";
import { IGlRendererSharedState } from "./gl-renderer-shared-state";

/**
 * @public
 * Webgl entity renderer factory.
 */
export class GlRendererFactory<TCtx extends TGlContext, TExts extends TGlExtensionKeys>
    implements IEntityRendererFactory<IGlProgramSpec, TGlEntityRenderer<TCtx, TExts>>
{
    public static createOne<TCtx extends TGlContext, TExts extends TGlExtensionKeys>
    (
        context: TCtx | null,
        requiredExtensions: TExts[],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        localizations: IErrorLocalization<any> = developerErrorLocalization,
        sharedState: IGlRendererSharedState,
    )
        : GlRendererFactory<TCtx, TExts> | null
    {
        if (context == null)
        {
            return null;
        }

        const isGl2 = context instanceof WebGL2RenderingContext;

        for (let i = 0, iEnd = requiredExtensions.length; i < iEnd; ++i)
        {
            const extension = requiredExtensions[i];

            if (context.getExtension(extension) == null)
            {
                if (isGl2 && GlRendererFactory.gl2StandardExtensions.has(extension))
                {
                    continue;
                }

                DEBUG_MODE && _Debug.verboseLog(`required extension "${extension}" not available`);
                return null;
            }
        }

        return new GlRendererFactory(context, isGl2, localizations, sharedState);
    }

    public createRenderer<TSpec extends IGlProgramSpec>
    (
        specification: TSpec,
    )
        : TGlEntityRenderer<TCtx, TUnpackArray<TSpec["requiredExtensions"]>>
    {
        const program = this.compileProgram(specification.vertexShader.source, specification.fragmentShader.source);
        const extensions = {} as TGlExtensions<TUnpackArray<TSpec["requiredExtensions"]>>;

        for (let i = 0, iEnd = specification.requiredExtensions.length; i < iEnd; ++i)
        {
            const name = specification.requiredExtensions[i];
            const ext = this.context.getExtension(name);

            if (ext == null)
            {
                if (this.isGl2 && GlRendererFactory.gl2StandardExtensions.has(name))
                {
                    continue;
                }

                _Production.error(`extension "${name}" is required but not available`);
            }

            extensions[name] = ext;
        }

        _Array.forEach(specification.optionalExtensions, (name) =>
        {
            const ext = this.context.getExtension(name);

            if (ext != null)
            {
                extensions[name] = ext;
            }
        });

        return new GlEntityRenderer<TCtx, TUnpackArray<TSpec["requiredExtensions"]>>(
            this.context,
            program,
            extensions,
            specification,
            this.sharedState,
        );
    }

    private compileProgram(vertexShaderSource: string, fragmentShaderSource: string): WebGLProgram
    {
        const vertexShader = this.compileShader(this.context.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(this.context.FRAGMENT_SHADER, fragmentShaderSource);

        const program = this.context.createProgram();

        if (program == null)
        {
            _Production.error("failed to create program");
        }

        this.context.attachShader(program, vertexShader);
        this.context.attachShader(program, fragmentShader);
        this.context.linkProgram(program);

        const linked = this.context.getProgramParameter(program, this.context.LINK_STATUS) as GLboolean;

        if (!linked)
        {
            const causedBy = this.context.getProgramInfoLog(program);
            this.context.deleteProgram(program);

            throw new GlCompileError(this.localizations.glCompileError, causedBy, this.localizations.getTx);
        }
        else
        {
            return program;
        }
    }

    public setContext(context: TCtx): void
    {
        this.context = context;
    }

    public compileShader(type: number, source: string): WebGLShader
    {
        const shader = this.context.createShader(type);

        if (shader == null)
        {
            _Production.error(`failed to create shader of type ${type}`);
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
        private context: TCtx,
        private isGl2: boolean,
        private localizations: IErrorLocalization<unknown>,
        private readonly sharedState: IGlRendererSharedState,
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
