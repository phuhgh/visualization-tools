import { AGlUniformArray } from "./a-gl-uniform-array";
import { IReadonlyMat4 } from "rc-js-util";
import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";

/**
 * @public
 * Wrapper for webgl float matrix4 uniform.
 */
export class GlMat4Uniform extends AGlUniformArray<IReadonlyMat4<Float32Array>>
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
        renderer.context.uniformMatrix4fv(this.uniformLocation, this.transpose, data);
        this.isDirty = false;
    }
}