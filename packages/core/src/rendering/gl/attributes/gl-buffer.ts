import { _Debug, DebugProtectedView, TTypedArray } from "rc-js-util";
import { TGlBasicEntityRenderer } from "../entity-renderer/t-gl-basic-entity-renderer";
import { TGlContext } from "../t-gl-context";

/**
 * @public
 * Dirty checked wrapper of `ARRAY_BUFFER`. Modify via {@link IGlAttribute}.
 */
export class GlBuffer
{
    public isDirty: boolean = true;

    public constructor
    (
        private data: TTypedArray | null,
    )
    {
    }

    public initialize(entityRenderer: TGlBasicEntityRenderer): void
    {
        if (this.buffer == null)
        {
            this.buffer = entityRenderer.context.createBuffer();
        }
    }

    public setData(data: TTypedArray, changeId: number): void
    {
        DEBUG_MODE && _Debug.assert(changeId !== -1, "found changeId that was not initialized");

        if (this.changeId === changeId)
        {
            return;
        }

        this.changeId = changeId;
        this.isDirty = true;
        this.data = data;
    }

    public bindBuffer
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
                DebugProtectedView.unwrapProtectedView(this.data as TTypedArray)
                : this.data;

            context.bufferData(
                context.ARRAY_BUFFER,
                data,
                usage,
            );

            this.isDirty = false;
        }
    }

    public overrideValues
    (
        context: TGlContext,
        byteOffset: number,
        data: TTypedArray,
        changeId: number,
        updateId: number,
    )
        : void
    {
        if (this.mutatorId === changeId)
        {
            if (updateId < this.updateId)
            {
                return;
            }
            else
            {
                this.updateId = updateId;
            }
        }
        else
        {
            this.updateId = updateId;
        }

        context.bufferSubData(context.ARRAY_BUFFER, byteOffset, data);
        this.mutatorId = changeId;
    }

    private buffer: WebGLBuffer | null = null;
    private changeId = -1;
    private mutatorId = -1;
    private updateId = -1;
}