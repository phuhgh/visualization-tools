import { AGlUniformArray } from "./a-gl-uniform-array";
import { IReadonlyVec4 } from "rc-js-util";
import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";

/**
 * @public
 * Wrapper for webgl float vector4 uniform.
 */
export class GlVec4Uniform extends AGlUniformArray<IReadonlyVec4<Float32Array>>
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
        renderer.context.uniform4fv(this.uniformLocation, data);
        this.isDirty = false;
    }
}
