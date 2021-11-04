import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";
import { IGlUniform } from "./i-gl-uniform";

/**
 * @public
 * wrapper for a single uniform value.
 */
export abstract class AGlUniformValue implements IGlUniform
{
    public isDirty = true;

    public constructor
    (
        public name: string,
        public data: number,
    )
    {
    }

    public onContextLost(): void
    {
        this.isDirty = true;
        this.uniformLocation = null;
    }

    public abstract bind(renderer: TGlBasicComponentRenderer): void;

    public initialize(componentRenderer: TGlBasicComponentRenderer): void
    {
        componentRenderer.addUniform(this);
        this.uniformLocation = componentRenderer.context.getUniformLocation(componentRenderer.program, this.name);
    }

    public setData(data: number): void
    {
        if (this.data !== data)
        {
            this.data = data;
            this.isDirty = true;
        }
    }

    protected uniformLocation: WebGLUniformLocation | null = null;
}
