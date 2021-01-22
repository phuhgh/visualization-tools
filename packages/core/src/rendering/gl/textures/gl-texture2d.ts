import { TGlBasicEntityRenderer } from "../entity-renderer/t-gl-basic-entity-renderer";
import { _Production } from "rc-js-util";

/**
 * @public
 * Currently only supports canvas as texture.
 */
export class GlTexture2d
{
    public constructor
    (
        public name: string,
        public data: TexImageSource | null,
    )
    {
    }

    public initialize(entityRenderer: TGlBasicEntityRenderer): void
    {
        // FIXME this doesn't allow sharing of units where we need more than the max units
        this.textureUnit = entityRenderer.sharedState.claimTextureUnit();
        const context = entityRenderer.context;
        context.activeTexture(context.TEXTURE0 + this.textureUnit);
        this.uniformLocation = context.getUniformLocation(entityRenderer.program, this.name);
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

    public bind(entityRenderer: TGlBasicEntityRenderer): void
    {
        if (this.data == null || this.textureUnit == null)
        {
            _Production.error("expected data to be initialized");
        }

        if (this.isDirty)
        {
            const context = entityRenderer.context;
            context.activeTexture(context.TEXTURE0 + this.textureUnit);
            context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, this.data);
            this.isDirty = false;
        }
    }

    protected uniformLocation: WebGLUniformLocation | null = null;
    private texture: WebGLTexture | null = null;
    private isDirty = true;
    private textureUnit: number | null = null;
}