import { TUnknownComponentRenderer } from "../../rendering/t-unknown-component-renderer";
import { IGraphicsComponent } from "../../rendering/graphics-components/i-graphics-component";
import { NoTransformProvider } from "../../rendering/transform-components/no-transform-provider";
import { EGraphicsComponentType } from "../../rendering/graphics-components/e-graphics-component-type";

/**
 * @public
 * A graphics component for canvas renderer that doesn't draw.
 */
export class CanvasNoOpGraphicsComponent
    implements IGraphicsComponent<TUnknownComponentRenderer, unknown, unknown>
{
    public readonly type = EGraphicsComponentType.Entity;
    public specification = {};
    public transform = new NoTransformProvider();

    public getCacheId(): string
    {
        return "NoOpGraphicsComponent";
    }

    public initialize(): void
    {
        // no action needed
    }

    public onBeforeUpdate(): void
    {
        // no action needed
    }

    public update(): void
    {
        // no action needed
    }
}