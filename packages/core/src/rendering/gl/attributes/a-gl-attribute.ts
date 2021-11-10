import { IGlAttribute } from "./i-gl-attribute";
import { _Debug, TTypedArray } from "rc-js-util";
import { TGlInstancedComponentRenderer } from "../component-renderer/t-gl-instanced-component-renderer";
import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";
import { TGlContext } from "../t-gl-context";
import { TGl2ComponentRenderer } from "../component-renderer/t-gl2-component-renderer";
import { IGlBuffer } from "../buffers/i-gl-buffer";
import { AttributeState, IAttributeState } from "./attribute-state";

/**
 * @public
 * {@inheritDoc IGlAttribute}
 */
export abstract class AGlAttribute<TArray extends TTypedArray>
    implements IGlAttribute<TArray>
{
    /**
     * DO NOT MANUALLY SHARE BUFFERS, **USE LINK**!
     */
    public constructor
    (
        public readonly name: string,
        buffer: IGlBuffer<TArray>,
        public readonly componentsPerVertex: number,
        private byteOffset: number = 0,
        private byteStride: number = 0,
        private readonly normalized: boolean = false,
    )
    {
        this.sharableState = new AttributeState<TArray>(this, buffer);
    }

    public onContextLost(): void
    {
        this.ptrRequiresSetting = true;
        this.sharableState.buffer.onContextLost();
        this.attributeLocation = null;
        this.type = null;
        this.divisor = null;
    }

    public initialize
    (
        componentRenderer: TGlBasicComponentRenderer,
    )
        : void
    {
        componentRenderer.addAttribute(this);
        this.sharableState.buffer.initialize(componentRenderer.context);
        this.attributeLocation = componentRenderer.getAttributeLocation(this.name);
        this.type = this.getGlType(componentRenderer.context);

        if (componentRenderer.isVaoActive())
        {
            componentRenderer.context.enableVertexAttribArray(this.attributeLocation);
        }
    }

    public getBuffer(): IGlBuffer<TArray>
    {
        return this.sharableState.buffer;
    }

    public setBuffer(buffer: IGlBuffer<TArray>): void
    {
        this.sharableState.buffer = buffer;
        const linkedAttributes = this.sharableState.attributes;

        for (let i = 0, iEnd = linkedAttributes.length; i < iEnd; ++i)
        {
            (linkedAttributes[i] as AGlAttribute<TArray>).ptrRequiresSetting = true;
        }
    }

    public setData(data: TArray, changeId: number): void
    {
        this.sharableState.buffer.setData(data, changeId);
    }

    public setSize
    (
        context: WebGL2RenderingContext,
        byteSize: number,
        usage: GLenum,
        changeId: number,
    )
        : void
    {
        this.sharableState.buffer.setSize(context, byteSize, usage, changeId);
    }

    public swapBuffer(attribute: IGlAttribute<TArray>): void
    {
        DEBUG_MODE && _Debug.assert(this.sharableState.buffer !== attribute.getBuffer(), "attempted to swap buffer with itself");
        const tmp = this.sharableState.buffer;
        this.setBuffer(attribute.getBuffer());
        attribute.setBuffer(tmp);
    }

    public setSubBufferData
    (
        componentRenderer: TGlBasicComponentRenderer,
        byteOffset: number,
        data: TArray,
        changeId: number,
        modificationId: number,
    )
        : void
    {
        this.sharableState.buffer.setSubBufferData(componentRenderer.context, byteOffset, data, changeId, modificationId);
    }

    public setOffset(byteOffset: number): void
    {
        if (this.byteOffset !== byteOffset)
        {
            this.ptrRequiresSetting = true;
            this.byteOffset = byteOffset;
        }
    }

    public setStride(byteStride: number): void
    {
        if (this.byteStride !== byteStride)
        {
            this.ptrRequiresSetting = true;
            this.byteStride = byteStride;
        }
    }

    // FIXME this is missing bind constant / default

    public bindTransform
    (
        componentRenderer: TGl2ComponentRenderer,
        index: number,
    )
        : void
    {
        this.sharableState.buffer.bindTransform(componentRenderer.context, index);
    }

    public bindArray
    (
        componentRenderer: TGlBasicComponentRenderer,
        usage: GLenum = componentRenderer.context.DYNAMIC_DRAW,
    )
        : void
    {
        const context = componentRenderer.context;

        if (this.attributeLocation == null || this.type == null)
        {
            DEBUG_MODE && _Debug.error(`expected attribute ${this.name} to be initialized`);
            return;
        }

        if (componentRenderer.isVaoActive())
        {
            if (this.sharableState.buffer.isDirty || this.ptrRequiresSetting)
            {
                this.sharableState.buffer.bindArray(context, usage);
            }

            if (this.ptrRequiresSetting)
            {
                this.setAttributePtr(context, this.attributeLocation, this.type);
            }
        }
        else
        {
            this.sharableState.buffer.bindArray(context, usage);
            context.enableVertexAttribArray(this.attributeLocation);
            this.setAttributePtr(context, this.attributeLocation, this.type);
        }

        this.ptrRequiresSetting = false;
    }

    public bindArrayInstanced
    (
        componentRenderer: TGlInstancedComponentRenderer,
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

        this.bindArray(componentRenderer, usage);

        if (componentRenderer.isVaoActive())
        {
            if (this.divisor === divisor)
            {
                return;
            }

            this.divisor = divisor;
        }

        if (componentRenderer.isGl2)
        {
            componentRenderer.context.vertexAttribDivisor(this.attributeLocation, divisor);
        }
        else
        {
            componentRenderer.extensions.ANGLE_instanced_arrays.vertexAttribDivisorANGLE(this.attributeLocation, divisor);
        }
    }

    public reset(componentRenderer: TGlBasicComponentRenderer): void
    {
        if (componentRenderer.isVaoActive())
        {
            return;
        }

        if (this.attributeLocation == null)
        {
            DEBUG_MODE && _Debug.error(`expected attribute ${this.name} to be initialized`);
            return;
        }

        if (componentRenderer.isGl2)
        {
            componentRenderer.context.vertexAttribDivisor(this.attributeLocation, 0);
        }
        else if (componentRenderer.extensions.ANGLE_instanced_arrays != null)
        {
            componentRenderer.extensions.ANGLE_instanced_arrays.vertexAttribDivisorANGLE(this.attributeLocation, 0);
        }

        componentRenderer.context.disableVertexAttribArray(this.attributeLocation);
    }

    public link(sharedState: IAttributeState<TArray>): void
    {
        DEBUG_MODE && _Debug.assert(this.attributeLocation == null, "link attributes before using programs");

        this.sharableState = sharedState;
        sharedState.addAttribute(this);
    }

    public getSharableState(): IAttributeState<TArray>
    {
        return this.sharableState;
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
    private ptrRequiresSetting: boolean = true;
    private divisor: number | null = null;
    private sharableState: IAttributeState<TArray>;
}
