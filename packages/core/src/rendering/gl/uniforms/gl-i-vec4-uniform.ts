import { AGlUniformArray } from "./a-gl-uniform-array";
import { IReadonlyVec4 } from "rc-js-util";
import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";

/**
 * @public
 * Wrapper for webgl int32 vector4 uniform.
 */
export class GlIVec4Uniform extends AGlUniformArray<IReadonlyVec4<Int32Array>>
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
        renderer.context.uniform4iv(this.uniformLocation, data);
        this.isDirty = false;
    }
}
