import { AGlUniformArray } from "./a-gl-uniform-array";
import { _Debug, IReadonlyMat3 } from "rc-js-util";
import { TGlBasicEntityRenderer } from "../entity-renderer/t-gl-basic-entity-renderer";

/**
 * @public
 * Wrapper for webgl float matrix3 uniform.
 */
export class GlMat3Uniform extends AGlUniformArray<IReadonlyMat3<Float32Array>>
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
        renderer.context.uniformMatrix3fv(this.uniformLocation, this.transpose, data);
    }
}