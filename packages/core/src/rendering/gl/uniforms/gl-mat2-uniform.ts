import { AGlUniformArray } from "./a-gl-uniform-array";
import { IReadonlyMat2 } from "rc-js-util";
import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";

/**
 * @public
 * Wrapper for webgl float matrix2 uniform.
 */
export class GlMat2Uniform extends AGlUniformArray<IReadonlyMat2<Float32Array>>
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
        renderer.context.uniformMatrix2fv(this.uniformLocation, this.transpose, data);
        this.isDirty = false;
    }
}