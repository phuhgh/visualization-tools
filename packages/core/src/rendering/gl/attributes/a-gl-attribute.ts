import { IGlAttribute } from "./i-gl-attribute";
import { _Debug, TTypedArray } from "rc-js-util";
import { TGlInstancedEntityRenderer } from "../entity-renderer/t-gl-instanced-entity-renderer";
import { TGlBasicEntityRenderer } from "../entity-renderer/t-gl-basic-entity-renderer";
import { TGlContext } from "../t-gl-context";
import { GlBuffer } from "./gl-buffer";

/**
 * @public
 * {@inheritDoc IGlAttribute}
 */
export abstract class AGlAttribute implements IGlAttribute
{
    public static extractBuffer(attribute: IGlAttribute): GlBuffer
    {
        return (attribute as AGlAttribute).buffer;
    }

    public static setBuffer(attribute: IGlAttribute, buffer: GlBuffer): void
    {
        (attribute as AGlAttribute).buffer = buffer;
    }

    public constructor
    (
        public readonly name: string,
        private buffer: GlBuffer,
        public readonly componentsPerVertex: number,
        private byteOffset: number = 0,
        private readonly byteStride: number = 0,
        private readonly normalized: boolean = false,
    )
    {
    }

    public initialize
    (
        entityRenderer: TGlBasicEntityRenderer,
    )
        : void
    {
        entityRenderer.addAttribute(this);
        this.buffer.initialize(entityRenderer);
        this.attributeLocation = entityRenderer.getAttributeLocation(this.name);
        this.type = this.getGlType(entityRenderer.context);

        if (entityRenderer.isVaoActive())
        {
            entityRenderer.context.enableVertexAttribArray(this.attributeLocation);
        }
    }

    public setData(data: TTypedArray, changeId: number): void
    {
        this.buffer.setData(data, changeId);
    }

    public overrideValues
    (
        entityRenderer: TGlBasicEntityRenderer,
        byteOffset: number,
        data: TTypedArray,
        changeId: number,
        updateId: number,
    )
        : void
    {
        this.buffer.overrideValues(entityRenderer.context, byteOffset, data, changeId, updateId);
    }

    public setOffset(byteOffset: number): void
    {
        if (this.byteOffset !== byteOffset)
        {
            this.isOffsetDirty = true;
            this.byteOffset = byteOffset;
        }
    }

    // FIXME this is missing bind constant / default, sub buffer updates & transforms

    public bind
    (
        entityRenderer: TGlBasicEntityRenderer,
        usage: GLenum = entityRenderer.context.DYNAMIC_DRAW,
    )
        : void
    {
        if (this.attributeLocation == null || this.type == null)
        {
            DEBUG_MODE && _Debug.error(`expected attribute ${this.name} to be initialized`);
            return;
        }

        if (entityRenderer.isVaoActive())
        {
            if (this.buffer.isDirty || this.isOffsetDirty)
            {
                this.buffer.bindBuffer(entityRenderer.context, usage);
            }

            if (this.isOffsetDirty)
            {
                this.setAttributePtr(entityRenderer.context, this.attributeLocation, this.type);
            }
        }
        else
        {
            this.buffer.bindBuffer(entityRenderer.context, usage);
            this.setAttributePtr(entityRenderer.context, this.attributeLocation, this.type);
        }

        this.isOffsetDirty = false;
    }

    public bindInstanced
    (
        entityRenderer: TGlInstancedEntityRenderer,
        divisor: number,
        usage?: GLenum,
    )
        : void
    {
        if (this.attributeLocation == null)
        {
            DEBUG_MODE && _Debug.error(`expected attribute ${this.name} to be initialized`);
            return;
        }

        this.bind(entityRenderer, usage);

        if (entityRenderer.isVaoActive())
        {
            if (this.divisor === divisor)
            {
                return;
            }

            this.divisor = divisor;
        }

        if (entityRenderer.isGl2)
        {
            entityRenderer.context.vertexAttribDivisor(this.attributeLocation, divisor);
        }
        else
        {
            entityRenderer.extensions.ANGLE_instanced_arrays.vertexAttribDivisorANGLE(this.attributeLocation, divisor);
        }
    }

    public reset(entityRenderer: TGlBasicEntityRenderer): void
    {
        if (entityRenderer.isVaoActive())
        {
            return;
        }

        if (this.attributeLocation == null)
        {
            DEBUG_MODE && _Debug.error(`expected attribute ${this.name} to be initialized`);
            return;
        }

        if (entityRenderer.isGl2)
        {
            entityRenderer.context.vertexAttribDivisor(this.attributeLocation, 0);
        }
        else if (entityRenderer.extensions.ANGLE_instanced_arrays != null)
        {
            entityRenderer.extensions.ANGLE_instanced_arrays.vertexAttribDivisorANGLE(this.attributeLocation, 0);
        }

        entityRenderer.context.disableVertexAttribArray(this.attributeLocation);
    }

    private setAttributePtr
    (
        context: TGlContext,
        attributeLocation: GLuint,
        type: GLenum,
    )
        : void
    {
        context.vertexAttribPointer(
            attributeLocation,
            this.componentsPerVertex,
            type,
            this.normalized,
            this.byteStride,
            this.byteOffset,
        );
    }

    protected abstract getGlType(context: WebGLRenderingContext): GLenum;

    private attributeLocation: number | null = null;
    private type: GLenum | null = null;
    private isOffsetDirty: boolean = true;
    private divisor: number | null = null;
}