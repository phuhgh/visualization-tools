import { AGlUniformArray } from "./a-gl-uniform-array";
import { IReadonlyMat3 } from "rc-js-util";
import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";

/**
 * @public
 * Wrapper for webgl float matrix3 uniform.
 */
export class GlMat3Uniform extends AGlUniformArray<IReadonlyMat3<Float32Array>>
{
    public bind
    (
        renderer: TGlBasicComponentRenderer,
    )
        : void
    {
        if (!this.isDirty)
        {
            return;
        }

        const data = this.data as unknown as Float32Array;
        renderer.context.uniformMatrix3fv(this.uniformLocation, this.transpose, data);
        this.isDirty = false;
    }
}