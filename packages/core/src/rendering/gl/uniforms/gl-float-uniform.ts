import { AGlUniformValue } from "./a-gl-uniform-value";
import { TGlBasicEntityRenderer } from "../entity-renderer/t-gl-basic-entity-renderer";
import { _Debug } from "rc-js-util";

/**
 * @public
 * wrapper for a single uniform float.
 */
export class GlFloatUniform extends AGlUniformValue
{
    public bind(renderer: TGlBasicEntityRenderer): void
    {
        DEBUG_MODE && _Debug.runBlock(() =>
        {
            if (this.uniformLocation == null)
            {
                console.debug(`failed to bind uniform: ${this.name}`);
            }
        });

        renderer.context.uniform1f(this.uniformLocation, this.data);
    }
}
