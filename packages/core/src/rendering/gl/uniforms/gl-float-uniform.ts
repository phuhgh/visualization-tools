import { AGlUniformValue } from "./a-gl-uniform-value";
import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";

/**
 * @public
 * wrapper for a single uniform float.
 */
export class GlFloatUniform extends AGlUniformValue
{
    public bind(renderer: TGlBasicComponentRenderer): void
    {
        if (!this.isDirty)
        {
            return;
        }

        renderer.context.uniform1f(this.uniformLocation, this.data);
        this.isDirty = false;
    }
}
