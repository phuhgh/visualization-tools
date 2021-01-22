import { IGraphicsComponentSpecification } from "../../rendering/i-graphics-component-specification";
import { TUnknownEntityRenderer } from "../../rendering/t-unknown-entity-renderer";

/**
 * @public
 * A graphics component for canvas renderer that doesn't draw.
 */
export class CanvasNoOpGraphicsComponent
    implements IGraphicsComponentSpecification<TUnknownEntityRenderer, unknown, unknown>
{
    public specification = {};

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