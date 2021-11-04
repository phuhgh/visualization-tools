import { _Debug, DebugProtectedView, TTypedArrayCtor } from "rc-js-util";
import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";
import { TGlContext } from "../t-gl-context";
import { IGlBuffer } from "./i-gl-buffer";

/**
 * @public
 * {@inheritDoc IGlBuffer}
 */
export class GlBuffer<TCtor extends TTypedArrayCtor> implements IGlBuffer<InstanceType<TCtor>>
{
    public isDirty: boolean = true;

    public constructor
    (
        private data: InstanceType<TCtor> | null,
        private ctor: TCtor,
    )
    {
        this.updateSizeFromArray(data);
    }

    public onContextLost(): void
    {
        this.buffer = null;
        this.isDirty = true;
        this.changeId = -1;
        this.mutatorId = -1;
        this.modificationId = -1;
        this.byteSize = -1;
    }

    public initialize(componentRenderer: TGlBasicComponentRenderer): void
    {
        if (this.buffer == null)
        {
            this.buffer = componentRenderer.context.createBuffer();
        }
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
        DEBUG_MODE && _Debug.assert(changeId !== -1, "found changeId that was not initialized");

        if (this.changeId === changeId)
        {
            return;
        }

        this.data = null;
        this.changeId = changeId;
        context.bindBuffer(context.ARRAY_BUFFER, this.buffer);
        context.bufferData(context.ARRAY_BUFFER, byteSize, usage);
        this.byteSize = byteSize;
    }

    public setData(data: InstanceType<TCtor>, changeId: number): void
    {
        DEBUG_MODE && _Debug.assert(changeId !== -1, "found changeId that was not initialized");

        if (this.changeId === changeId)
        {
            return;
        }

        this.changeId = changeId;
        this.isDirty = true;
        this.data = data;
        this.updateSizeFromArray(data);
    }

    public bindArray
    (
        context: TGlContext,
        usage: GLenum,
    )
        : void
    {
        context.bindBuffer(context.ARRAY_BUFFER, this.buffer);

        if (this.isDirty)
        {
            DEBUG_MODE && _Debug.assert(this.data != null, "expected data to have been set");

            const data = DEBUG_MODE ?
                DebugProtectedView.unwrapProtectedView(this.data as InstanceType<TCtor>)
                : this.data;

            context.bufferData(context.ARRAY_BUFFER, data, usage);
            this.isDirty = false;
        }
    }

    public bindTransform
    (
        context: WebGL2RenderingContext,
        index: number,
    )
        : void
    {
        context.bindBufferBase(context.TRANSFORM_FEEDBACK_BUFFER, index, this.buffer);
        this.isDirty = false;
    }

    public getSubBufferData
    (
        context: WebGL2RenderingContext,
        result: InstanceType<TCtor> = new this.ctor(this.byteSize / this.ctor.BYTES_PER_ELEMENT) as InstanceType<TCtor>,
    )
        : InstanceType<TCtor>
    {
        context.bindBuffer(context.ARRAY_BUFFER, this.buffer);
        context.getBufferSubData(context.ARRAY_BUFFER, 0, result);
        return result;
    }

    public setSubBufferData
    (
        context: TGlContext,
        byteOffset: number,
        data: InstanceType<TCtor>,
        changeId: number,
        modificationId: number,
    )
        : void
    {
        if (this.mutatorId === changeId)
        {
            if (modificationId < this.modificationId)
            {
                return;
            }
            else
            {
                this.modificationId = modificationId;
            }
        }
        else
        {
            this.modificationId = modificationId;
        }

        context.bufferSubData(context.ARRAY_BUFFER, byteOffset, data);
        this.mutatorId = changeId;
    }

    private updateSizeFromArray(data: InstanceType<TCtor> | null): void
    {
        this.byteSize = data == null
            ? -1
            : data.byteLength;
    }

    private buffer: WebGLBuffer | null = null;
    private changeId = -1;
    private mutatorId = -1;
    private modificationId = -1;
    private byteSize = -1;
}

