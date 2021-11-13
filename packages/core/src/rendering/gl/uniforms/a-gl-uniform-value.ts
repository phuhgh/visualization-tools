import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";
import { IGlUniform } from "./i-gl-uniform";
import { _Debug } from "rc-js-util";

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

        DEBUG_MODE && _Debug.runBlock(() =>
        {
            if (this.uniformLocation == null)
            {
                _Debug.verboseLog(`failed to bind uniform "${this.name}" of type "${this.data.constructor.name}"`);
            }
        });
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
