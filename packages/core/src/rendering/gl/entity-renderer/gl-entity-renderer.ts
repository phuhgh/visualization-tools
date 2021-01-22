import { IGlExtensions, TGlExtensionKeys } from "../i-gl-extensions";
import { IGlProgramSpec } from "../gl-program-specification";
import { TGlContext } from "../t-gl-context";
import { _Map, TNeverPredicate, TPredicate } from "rc-js-util";
import { IBaseEntityRenderer } from "../../i-base-entity-renderer";
import { IGlRendererSharedState } from "../gl-renderer-shared-state";
import { IGlAttribute } from "../attributes/i-gl-attribute";
import { TGlBasicEntityRenderer } from "./t-gl-basic-entity-renderer";

/**
 * @public
 * `true` if `TKey` is present in `TExts`, `false` otherwise.
 */
export type TGlHasExtension<TExts extends TGlExtensionKeys, TKey extends TGlExtensionKeys> = TNeverPredicate<Exclude<TKey, TExts>, true, false>;

/**
 * @public
 * `true` if `TCtx` extends `WebGL2RenderingContext`, `false` otherwise.
 */
export type TIsGl2<TCtx extends TGlContext> = TCtx extends WebGL2RenderingContext
    ? true
    : false
    ;

/**
 * @public
 * Maps extension keys to extensions.
 */
export type TGlExtensions<TExts extends TGlExtensionKeys> = ([TExts] extends [never]
    ? {}
    : Pick<IGlExtensions, TExts>) & Partial<IGlExtensions>
    ;

/**
 * @public
 * Base gl entity renderer.
 */
export interface IGlEntityRenderer<TCtx extends TGlContext, TExts extends TGlExtensionKeys>
    extends IBaseEntityRenderer<IGlProgramSpec, TCtx>
{
    readonly specification: IGlProgramSpec;
    readonly program: WebGLProgram;
    readonly extensions: TGlExtensions<TExts>;
    readonly isGl2: TIsGl2<TCtx>;
    readonly sharedState: IGlRendererSharedState;
    isVaoActive(): boolean;
    useProgram(): void;
    getAttributeLocation(name: string): number;
    addAttribute(attribute: IGlAttribute): void;
}

/**
 * @public
 * Gl entity renderer with extensions.
 */
export type TGlEntityRenderer<TCtx extends TGlContext, TExts extends TGlExtensionKeys> =
    & IGlEntityRenderer<TCtx, TExts>
    & TPredicate<TGlHasExtension<TExts, "ANGLE_instanced_arrays">, IGlEntityInstancedRenderer, {}>
    & TPredicate<TIsGl2<TCtx>, IGlEntityInstancedRenderer, {}>
    & TPredicate<TGlHasExtension<TExts, "OES_vertex_array_object">, IGlEntityVAORenderer, {}>
    & TPredicate<TIsGl2<TCtx>, IGlEntityVAORenderer, {}>
    ;

/**
 * @public
 * ANGLE_instanced_arrays or webgl2 equivalent.
 */
export interface IGlEntityInstancedRenderer
{
    drawInstancedArrays
    (
        mode: GLenum,
        first: GLint,
        count: GLsizei,
        instanceCount: GLsizei,
    )
        : void;
}

/**
 * @public
 * OES_vertex_array_object or webgl2 equivalent.
 */
export interface IGlEntityVAORenderer
{
    vao: WebGLVertexArrayObject | WebGLVertexArrayObjectOES | null;
    createVao(): WebGLVertexArrayObject | WebGLVertexArrayObjectOES | null;
    bindVao(vao: WebGLVertexArrayObject | WebGLVertexArrayObjectOES | null): void;
    unbindVao(): void;
}

/**
 * @public
 * Webgl / webgl2 entity renderer implementation.
 */
export class GlEntityRenderer<TCtx extends TGlContext, TExts extends TGlExtensionKeys>
    implements IGlEntityRenderer<TCtx, TExts>,
               IGlEntityInstancedRenderer,
               IGlEntityVAORenderer
{
    public readonly vao: WebGLVertexArrayObject | WebGLVertexArrayObjectOES | null;
    public readonly isGl2: TIsGl2<TCtx>;

    public constructor
    (
        public readonly context: TCtx,
        public readonly program: WebGLProgram,
        public readonly extensions: TGlExtensions<TExts>,
        public readonly specification: IGlProgramSpec,
        public readonly sharedState: IGlRendererSharedState,
    )
    {
        this.isGl2 = this.context instanceof WebGL2RenderingContext as TIsGl2<TCtx>;
        this.vao = this.createVao();
    }

    public onBeforeDraw(): void
    {
        this.useProgram();

        if (this.vao != null)
        {
            this.bindVao(this.vao);
        }
    }

    public onAfterDraw(): void
    {
        if (this.vao == null)
        {
            const attributes = this.attributes;

            for (let i = 0, iEnd = attributes.length; i < iEnd; ++i)
            {
                attributes[i].reset(this as TGlBasicEntityRenderer);
            }
        }
    }

    public onBeforeInitialization(): void
    {
        if (this.vao != null)
        {
            this.bindVao(this.vao);
        }
    }

    public onAfterInitialization(): void
    {
        if (this.vao != null)
        {
            this.unbindVao();
        }
    }

    public getAttributeLocation(name: string): number
    {
        return _Map.initializeGet(this.attributeLocations, name, () => this.context.getAttribLocation(this.program, name));
    }

    public useProgram(): void
    {
        this.context.useProgram(this.program);
    }

    public isVaoActive(): boolean
    {
        return this.vao != null;
    }

    public drawInstancedArrays
    (
        mode: GLenum,
        first: GLint,
        count: GLsizei,
        instanceCount: GLsizei,
    )
        : void
    {
        if (this.isGl2)
        {
            (this.context as WebGL2RenderingContext).drawArraysInstanced(mode, first, count, instanceCount);
        }
        else
        {
            (this.extensions as TGlExtensions<"ANGLE_instanced_arrays">).ANGLE_instanced_arrays.drawArraysInstancedANGLE(mode, first, count, instanceCount);
        }
    }

    public bindVao(vao: WebGLVertexArrayObject | WebGLVertexArrayObjectOES | null): void
    {
        const toBind = vao === undefined ? this.vao : vao;

        if (this.isGl2)
        {
            (this.context as WebGL2RenderingContext).bindVertexArray(toBind);
        }
        else
        {
            (this.extensions as TGlExtensions<"OES_vertex_array_object">).OES_vertex_array_object.bindVertexArrayOES(toBind);
        }
    }

    public unbindVao(): void
    {
        this.bindVao(null);
    }

    public createVao(): WebGLVertexArrayObject | WebGLVertexArrayObjectOES | null
    {
        if (this.isGl2)
        {
            return (this.context as WebGL2RenderingContext).createVertexArray();
        }

        if (this.extensions.OES_vertex_array_object != null)
        {
            return this.extensions.OES_vertex_array_object.createVertexArrayOES();
        }

        return null;
    }

    public addAttribute(attribute: IGlAttribute): void
    {
        this.attributes.push(attribute);
    }

    private readonly attributeLocations = new Map<string, number>();
    private readonly attributes: IGlAttribute[] = [];
}
