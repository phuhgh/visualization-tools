import { IRendererSharedState } from "../i-renderer-shared-state";
import { IReadonlyRange2d, TTypedArray } from "rc-js-util";
import { TGlContext } from "./t-gl-context";
import { IGlBuffer } from "./buffers/i-gl-buffer";
import { EntityBufferStore, IEntityBufferStore } from "../buffers/entity-buffer-store";
import { IBufferLayout } from "../buffers/buffer-layout";
import { IGlExtensions } from "./i-gl-extensions";
import { TGlExtensions } from "./component-renderer/gl-component-renderer";

/**
 * @public
 * Webgl state that is shred between entity renderers.
 */
export interface IGlRendererSharedState extends IRendererSharedState
{
    readonly entityBuffers: IEntityBufferStore<IBufferLayout<IGlBuffer<TTypedArray>>>;
    readonly maxTextureCount: number;
    claimTextureUnit(): number;
    clearScissor(): void;
    setContext(context: TGlContext): void;

    isProgramActive(program: WebGLProgram): boolean;
    useProgram(program: WebGLProgram): void;
    /**
     * Usages outside of component renderer must ensure that the extension is loaded before calling (if GL1).
     */
    bindVao(vao: WebGLVertexArrayObject | WebGLVertexArrayObjectOES | null): void;
}

/**
 * @public
 * {@inheritDoc IGlRendererSharedState}
 */
export class GlRendererSharedState implements IGlRendererSharedState
{
    public textureIndex = 0;
    public frameCounter: number = 0;
    public scissorRange: IReadonlyRange2d<TTypedArray> | null = null;
    public readonly maxTextureCount: number;
    public readonly entityBuffers: IEntityBufferStore<IBufferLayout<IGlBuffer<TTypedArray>>> = new EntityBufferStore();

    public static createOne
    (
        context: TGlContext | null,
        extensions: TGlExtensions<never> | null,
        isGl2: boolean,
    )
        : IGlRendererSharedState | null
    {
        if (context == null || extensions == null)
        {
            return null;
        }

        // shared state is not type checked
        return new GlRendererSharedState(context, extensions as IGlExtensions, isGl2);
    }

    public constructor
    (
        private context: TGlContext,
        private extensions: IGlExtensions,
        private readonly isGl2: boolean,
    )
    {
        this.maxTextureCount = context.getParameter(context.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    }

    public setContext(context: TGlContext): void
    {
        this.context = context;
    }

    public onNewFrame(): void
    {
        ++this.frameCounter;
    }

    public onContextLost(): void
    {
        this.scissorRange = null;
        this.textureIndex = 0;
    }

    public clearScissor(): void
    {
        if (this.scissorRange != null)
        {
            this.context.disable(this.context.SCISSOR_TEST);
            this.updateScissorRange(null);
            this.scissorRange = null;
        }
    }

    public updateScissorRange(range: IReadonlyRange2d<TTypedArray> | null): void
    {
        if (range == null)
        {
            return this.clearScissor();
        }

        if (this.scissorRange == null)
        {
            this.context.enable(this.context.SCISSOR_TEST);
            this.scissorRange = range;
        }

        // scissor and viewport start in the bottom left
        this.context.scissor(
            range.getXMin() | 0,
            range.getYMin() | 0,
            1 + range.getXRange() | 0,
            1 + range.getYRange() | 0,
        );
    }

    public claimTextureUnit(): number
    {
        return this.textureIndex++;
    }

    public isProgramActive(program: WebGLProgram): boolean
    {
        return this.activeProgram === program;
    }

    public useProgram(program: WebGLProgram): void
    {
        if (this.activeProgram === program)
        {
            return;
        }

        this.context.useProgram(program);
        this.activeProgram = program;
    }

    public bindVao(vao: WebGLVertexArrayObject | WebGLVertexArrayObjectOES | null): void
    {
        if (this.activeVao === vao)
        {
            return;
        }

        if (this.isGl2)
        {
            (this.context as WebGL2RenderingContext).bindVertexArray(vao);
        }
        else
        {
            this.extensions.OES_vertex_array_object.bindVertexArrayOES(vao);
        }

        this.activeVao = vao;
    }

    private activeProgram: WebGLProgram | null = null;
    private activeVao: WebGLVertexArrayObject | WebGLVertexArrayObjectOES | null = null;
}