import { IGlAttribute } from "./i-gl-attribute";
import { AGlAttribute } from "./a-gl-attribute";

/**
 * @public
 * A Int32 {@link IGlAttribute}, only supported in GLES3.
 */
export class GlIntAttribute extends AGlAttribute implements IGlAttribute
{
    protected override getGlType(context: WebGLRenderingContext): GLenum
    {
        return context.INT;
    }
}