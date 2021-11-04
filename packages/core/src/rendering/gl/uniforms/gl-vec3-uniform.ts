import { AGlUniformArray } from "./a-gl-uniform-array";
import { IReadonlyVec3 } from "rc-js-util";
import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";

/**
 * @public
 * Wrapper for webgl float vector3 uniform.
 */
export class GlVec3Uniform extends AGlUniformArray<IReadonlyVec3<Float32Array>>
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
        renderer.context.uniform3fv(this.uniformLocation, data);
        this.isDirty = false;
    }
}