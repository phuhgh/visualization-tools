import { AGlUniformArray } from "./a-gl-uniform-array";
import { IReadonlyVec2 } from "rc-js-util";
import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";

/**
 * @public
 * Wrapper for webgl int32 vector2 uniform.
 */
export class GlIVec2Uniform extends AGlUniformArray<IReadonlyVec2<Int32Array>>
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
        renderer.context.uniform2iv(this.uniformLocation, data);
        this.isDirty = false;
    }
}
