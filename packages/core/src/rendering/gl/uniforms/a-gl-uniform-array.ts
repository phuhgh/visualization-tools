import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";
import { TGlUniformArray } from "./t-gl-uniform-array";
import { IGlUniform } from "./i-gl-uniform";

/**
 * @public
 * Wrapper for webgl uniform.
 */
export abstract class AGlUniformArray<TData extends TGlUniformArray> implements IGlUniform
{
    public isDirty = true;

    public constructor
    (
        public name: string,
        public data: TData,
        protected transpose: boolean = false,
    )
    {
    }

    public abstract bind(renderer: TGlBasicComponentRenderer): void;

    public onContextLost(): void
    {
        this.isDirty = true;
        this.uniformLocation = null;
    }

    public initialize(componentRenderer: TGlBasicComponentRenderer): void
    {
        componentRenderer.addUniform(this);
        this.uniformLocation = componentRenderer.context.getUniformLocation(componentRenderer.program, this.name);
    }

    public setData(data: TData, changeId: number): void
    {
        if (this.changeId === changeId)
        {
            return;
        }

        this.changeId = changeId;
        this.data = data;
        this.isDirty = true;
    }

    protected uniformLocation: WebGLUniformLocation | null = null;
    protected changeId: number = Number.MIN_SAFE_INTEGER;
}
