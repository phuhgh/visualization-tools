import { IGraphicsComponentSpecification } from "../../rendering/i-graphics-component-specification";
import { TUnknownEntityRenderer } from "../../rendering/t-unknown-entity-renderer";
import { dummyGlProgramSpecification } from "../../rendering/gl/shaders/dummy-gl-program-specification";

/**
 * @public
 * A graphics component for webgl/webgl2 renderer that doesn't draw.
 */
export class GlNoOpGraphicsComponent implements IGraphicsComponentSpecification<TUnknownEntityRenderer, unknown, unknown>
{
    public specification = dummyGlProgramSpecification;

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
