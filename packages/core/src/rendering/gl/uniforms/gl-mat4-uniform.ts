import { AGlUniformArray } from "./a-gl-uniform-array";
import { _Debug, IReadonlyMat4 } from "rc-js-util";
import { TGlBasicEntityRenderer } from "../entity-renderer/t-gl-basic-entity-renderer";

/**
 * @public
 * Wrapper for webgl float matrix4 uniform.
 */
export class GlMat4Uniform extends AGlUniformArray<IReadonlyMat4<Float32Array>>
{
    public bind
    (
        renderer: TGlBasicEntityRenderer,
    )
        : void
    {
        DEBUG_MODE && _Debug.runBlock(() =>
        {
            if (this.uniformLocation == null)
            {
                console.debug(`failed to bind uniform: ${this.name}`);
            }
        });

        const data = this.data as unknown as Float32Array;
        renderer.context.uniformMatrix4fv(this.uniformLocation, this.transpose, data);
    }
}