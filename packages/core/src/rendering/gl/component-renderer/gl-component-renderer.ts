import { IGlExtensions, TGlExtensionKeys } from "../i-gl-extensions";
import { IGlProgramSpec } from "../gl-program-specification";
import { TGlContext } from "../t-gl-context";
import { _Array, _Map, DirtyCheckedUniqueCollection, IDirtyCheckedUniqueCollection, TNeverPredicate, TPredicate, TTypedArray } from "rc-js-util";
import { IBaseComponentRenderer } from "../../component-renderer/i-base-component-renderer";
import { IGlRendererSharedState } from "../gl-renderer-shared-state";
import { IGlAttribute } from "../attributes/i-gl-attribute";
import { TGlBasicComponentRenderer } from "./t-gl-basic-component-renderer";
import { IGlUniform } from "../uniforms/i-gl-uniform";
import { IGlTransformFeedback } from "../attributes/gl-transform-feedback";
import { IGlTexture2d } from "../textures/gl-texture2d";

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
export type TGlExtensions<TExts extends TGlExtensionKeys> =
    & TNeverPredicate<TExts, {}, Pick<IGlExtensions, TExts>>
    & Partial<IGlExtensions>
    ;

/**
 * @public
 * Base gl entity renderer.
 */
export interface IGlComponentRenderer<TCtx extends TGlContext, TExts extends TGlExtensionKeys>
    extends IBaseComponentRenderer<IGlProgramSpec, TCtx>
{
    readonly program: WebGLProgram;
    readonly extensions: TGlExtensions<TExts>;
    readonly isGl2: TIsGl2<TCtx>;
    readonly sharedState: IGlRendererSharedState;
    isVaoActive(): boolean;
    useProgram(): void;
    getAttributeLocation(name: string): number;
    addAttribute(attribute: IGlAttribute<TTypedArray>): void;
    addUniform(uniform: IGlUniform): void;
    addTransform(uniform: IGlTransformFeedback): void;
    addTexture(texture: IGlTexture2d): void;
}

/**
 * @public
 * Gl entity renderer with extensions.
 */
export type TGlComponentRenderer<TCtx extends TGlContext, TExts extends TGlExtensionKeys> =
    & IGlComponentRenderer<TCtx, TExts>
    & TPredicate<TGlHasExtension<TExts, "ANGLE_instanced_arrays">, IGlComponentInstancedRenderer, {}>
    & TPredicate<TIsGl2<TCtx>, IGlComponentInstancedRenderer, {}>
    & TPredicate<TGlHasExtension<TExts, "OES_vertex_array_object">, IGlComponentVAORenderer, {}>
    & TPredicate<TIsGl2<TCtx>, IGlComponentVAORenderer, {}>
    ;

/**
 * @public
 * ANGLE_instanced_arrays or webgl2 equivalent.
 */
export interface IGlComponentInstancedRenderer
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
export interface IGlComponentVAORenderer
{
    vao: WebGLVertexArrayObject | WebGLVertexArrayObjectOES | null;
    createVao(): WebGLVertexArrayObject | WebGLVertexArrayObjectOES | null;
    bindVao(vao: WebGLVertexArrayObject | WebGLVertexArrayObjectOES | null): void;
}

/**
 * @public
 * Webgl / webgl2 component renderer implementation.
 */
export class GlComponentRenderer<TCtx extends TGlContext, TExts extends TGlExtensionKeys>
    implements IGlComponentRenderer<TCtx, TExts>,
               IGlComponentInstancedRenderer,
               IGlComponentVAORenderer
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

    public onContextLost(): void
    {
        _Array.forEach(this.attributes.getArray(), (attribute) => attribute.onContextLost());
        _Array.forEach(this.uniforms.getArray(), (uniform) => uniform.onContextLost());
        _Array.forEach(this.feedbackTransforms.getArray(), (transform) => transform.onContextLost());
        _Array.forEach(this.textures.getArray(), (texture) => texture.onContextLost());
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
            const attributes = this.attributes.getArray();

            for (let i = 0, iEnd = attributes.length; i < iEnd; ++i)
            {
                attributes[i].reset(this as TGlBasicComponentRenderer);
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
            this.bindVao(null);
        }
    }

    public getAttributeLocation(name: string): number
    {
        return _Map.initializeGet(this.attributeLocations, name, () => this.context.getAttribLocation(this.program, name));
    }

    public useProgram(): void
    {
        this.sharedState.useProgram(this.program);
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
        this.sharedState.bindVao(vao);
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

    public addAttribute(attribute: IGlAttribute<TTypedArray>): void
    {
        this.attributes.add(attribute);
    }

    public addUniform(uniform: IGlUniform): void
    {
        this.uniforms.add(uniform);
    }

    public addTransform(transformFeedback: IGlTransformFeedback): void
    {
        this.feedbackTransforms.add(transformFeedback);
    }

    public addTexture(texture: IGlTexture2d): void
    {
        this.textures.add(texture);
    }

    private readonly attributeLocations = new Map<string, number>();
    private readonly attributes: IDirtyCheckedUniqueCollection<IGlAttribute<TTypedArray>> = new DirtyCheckedUniqueCollection();
    private readonly uniforms: IDirtyCheckedUniqueCollection<IGlUniform> = new DirtyCheckedUniqueCollection();
    private readonly feedbackTransforms: IDirtyCheckedUniqueCollection<IGlTransformFeedback> = new DirtyCheckedUniqueCollection();
    private readonly textures: IDirtyCheckedUniqueCollection<IGlTexture2d> = new DirtyCheckedUniqueCollection();
}
