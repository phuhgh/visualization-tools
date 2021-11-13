import { GlBuffer } from "../buffers/gl-buffer";

/**
 * @public
 * Float32 {@link GlBuffer}.
 */
export class GlFloatBuffer extends GlBuffer<Float32ArrayConstructor>
{
    public constructor
    (
        data: InstanceType<typeof Float32Array> | null,
    )
    {
        super(data, Float32Array);
    }
}