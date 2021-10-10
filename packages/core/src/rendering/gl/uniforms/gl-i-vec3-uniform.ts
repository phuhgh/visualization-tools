import { AGlUniformArray } from "./a-gl-uniform-array";
import { IReadonlyVec3 } from "rc-js-util";
import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";

/**
 * @public
 * Wrapper for webgl int32 vector3 uniform.
 */
export class GlIVec3Uniform extends AGlUniformArray<IReadonlyVec3<Int32Array>>
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

        const data = this.data as unknown as Int32Array;
        renderer.context.uniform3iv(this.uniformLocation, data);
        this.isDirty = false;
    }
}
