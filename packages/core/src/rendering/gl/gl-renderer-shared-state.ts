import { IRendererSharedState } from "../i-renderer-shared-state";
import { IReadonlyRange2d, TTypedArray } from "rc-js-util";
import { TGlContext } from "./t-gl-context";


/**
 * @public
 * Webgl state that is shred between entity renderers.
 */
export interface IGlRendererSharedState extends IRendererSharedState
{
    readonly maxTextureCount: number;
    claimTextureUnit(): number;
    clearScissor(): void;
    setContext(context: TGlContext): void;
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
    public maxTextureCount: number;

    public constructor
    (
        private context: TGlContext,
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
}