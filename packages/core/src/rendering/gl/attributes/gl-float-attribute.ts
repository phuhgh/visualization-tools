import { IGlAttribute } from "./i-gl-attribute";
import { AGlAttribute } from "./a-gl-attribute";

/**
 * @public
 * A Float32 {@link IGlAttribute}.
 */
export class GlFloatAttribute
    extends AGlAttribute
    implements IGlAttribute
{
    protected override getGlType(context: WebGLRenderingContext): GLenum
    {
        return context.FLOAT;
    }
}