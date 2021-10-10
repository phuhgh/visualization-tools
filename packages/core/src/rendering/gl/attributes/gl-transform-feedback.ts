import { TGl2ComponentRenderer } from "../component-renderer/t-gl2-component-renderer";

/**
 * @public
 */
export interface IGlTransformFeedback
{
    initialize(transformRenderer: TGl2ComponentRenderer): void;
    onContextLost(): void;

    bind(transformRenderer: TGl2ComponentRenderer): void;
    beginTransform(transformRenderer: TGl2ComponentRenderer): void;
    endTransform(transformRenderer: TGl2ComponentRenderer): void;
}

/**
 * @public
 */
export class GlTransformFeedback implements IGlTransformFeedback
{
    public initialize(transformRenderer: TGl2ComponentRenderer): void
    {
        if (this.transformFeedback == null)
        {
            this.transformFeedback = transformRenderer.context.createTransformFeedback();
        }

        transformRenderer.addTransform(this);
    }

    public onContextLost(): void
    {
        this.transformFeedback = null;
    }

    public bind(transformRenderer: TGl2ComponentRenderer): void
    {
        const context = transformRenderer.context;
        context.bindTransformFeedback(context.TRANSFORM_FEEDBACK, this.transformFeedback);
    }

    public beginTransform(transformRenderer: TGl2ComponentRenderer): void
    {
        const context = transformRenderer.context;
        context.enable(context.RASTERIZER_DISCARD);
        context.beginTransformFeedback(context.POINTS);
    }

    public endTransform(transformRenderer: TGl2ComponentRenderer): void
    {
        const context = transformRenderer.context;
        context.endTransformFeedback();
        context.disable(context.RASTERIZER_DISCARD);
    }

    private transformFeedback: WebGLTransformFeedback | null = null;
}
