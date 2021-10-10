import { AGlUniformArray } from "./a-gl-uniform-array";
import { IReadonlyVec2 } from "rc-js-util";
import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";

/**
 * @public
 * Wrapper for webgl float vector2 uniform.
 */
export class GlVec2Uniform extends AGlUniformArray<IReadonlyVec2<Float32Array>>
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
        renderer.context.uniform2fv(this.uniformLocation, data);
        this.isDirty = false;
    }
}