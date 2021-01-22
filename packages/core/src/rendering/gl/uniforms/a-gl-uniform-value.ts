import { TGlBasicEntityRenderer } from "../entity-renderer/t-gl-basic-entity-renderer";

/**
 * @public
 * wrapper for a single uniform value.
 */
export abstract class AGlUniformValue
{
    public constructor
    (
        public name: string,
        public data: number,
    )
    {
    }

    public abstract bind
    (
        renderer: TGlBasicEntityRenderer,
    )
        : void;

    public initialize
    (
        entityRenderer: TGlBasicEntityRenderer,
    )
        : void
    {
        this.uniformLocation = entityRenderer.context.getUniformLocation(entityRenderer.program, this.name);
    }

    public setData(data: number): void
    {
        this.data = data;
    }

    protected uniformLocation: WebGLUniformLocation | null = null;
}
