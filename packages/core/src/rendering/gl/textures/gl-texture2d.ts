import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";
import { _Production } from "rc-js-util";

/**
 * @public
 * Currently only supports canvas as texture.
 */
export interface IGlTexture2d
{
    initialize(componentRenderer: TGlBasicComponentRenderer): void;
    onContextLost(): void;
}

/**
 * @public
 * {@inheritDoc IGlTexture2d}
 */
export class GlTexture2d implements IGlTexture2d
{
    public constructor
    (
        public name: string,
        public data: TexImageSource | null,
    )
    {
    }

    public initialize(componentRenderer: TGlBasicComponentRenderer): void
    {
        componentRenderer.addTexture(this);
        // FIXME this doesn't allow sharing of units where we need more than the max units
        this.textureUnit = componentRenderer.sharedState.claimTextureUnit();
        const context = componentRenderer.context;
        context.activeTexture(context.TEXTURE0 + this.textureUnit);
        this.uniformLocation = context.getUniformLocation(componentRenderer.program, this.name);
        this.texture = context.createTexture();
        context.bindTexture(context.TEXTURE_2D, this.texture);
        // FIXME this should be configurable
        context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, false);
        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.NEAREST);
        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.NEAREST);
        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
    }

    public updateData(canvas: HTMLCanvasElement): void
    {
        this.data = canvas;
        this.isDirty = true;
    }

    public bind(componentRenderer: TGlBasicComponentRenderer): void
    {
        if (this.data == null || this.textureUnit == null)
        {
            throw _Production.createError("expected data to be initialized");
        }

        if (this.isDirty)
        {
            const context = componentRenderer.context;
            context.activeTexture(context.TEXTURE0 + this.textureUnit);
            context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, this.data);
            this.isDirty = false;
        }
    }

    public onContextLost(): void
    {
        this.uniformLocation = null;
        this.texture = null;
        this.isDirty = true;
        this.textureUnit = null;
    }

    protected uniformLocation: WebGLUniformLocation | null = null;
    private texture: WebGLTexture | null = null;
    private isDirty = true;
    private textureUnit: number | null = null;
}