import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";
import { TTypedArray } from "rc-js-util";
import { TGlInstancedComponentRenderer } from "../component-renderer/t-gl-instanced-component-renderer";
import { TGl2ComponentRenderer } from "../component-renderer/t-gl2-component-renderer";
import { IGlBuffer } from "./i-gl-buffer";
import { IAttributeState } from "./attribute-state";

/**
 * @public
 * Wrapper for dirty checked GL attributes with VAO and shared mutable buffer support. `ChangeId`s must be generated
 * program wide to avoid collisions `IncrementingIdentifierFactory` (rc-js-util) is a suitable implementation.
 */
export interface IGlAttribute<TArray extends TTypedArray>
{
    /**
     * The name of the attribute, must match the shader name exactly.
     */
    readonly name: string;

    /**
     * The size of the attribute
     */
    readonly componentsPerVertex: number;

    getBuffer(): IGlBuffer<TArray>;
    setBuffer(buffer: IGlBuffer<TArray>): void;

    /**
     * Set the byte offset into the buffer.
     */
    setOffset(byteOffset: number): void;

    /**
     * Set the number of bytes to the start of the next attribute.
     */
    setStride(byteStride: number): void;

    /**
     * Copy new data into the buffer.
     */
    setData(data: TArray, changeId: number): void;

    /**
     * Resizes the buffer ready as a copy target. Clears the current data / dirty state.
     */
    setSize
    (
        context: WebGL2RenderingContext,
        byteSize: number,
        usage: GLenum,
        changeId: number,
    )
        : void;

    /**
     * Transfer this attribute's buffer to the argument and vice versa.
     */
    swapBuffer(attribute: IGlAttribute<TArray>): void;

    /**
     * Overwrite data in the buffer. The argument `modificationId` is provided to allow multiple writes per draw, if the
     * `modificationId` is larger than the previous call's `modificationId` then the modification is allowed. This resets whenever
     * `changeId` changes.
     */
    setSubBufferData
    (
        componentRenderer: TGlBasicComponentRenderer,
        byteOffset: number,
        data: TArray,
        changeId: number,
        modificationId: number,
    )
        : void;

    /**
     * Called once on context loss.
     */
    onContextLost(): void;

    /**
     * Called once on creation or context restored.
     */
    initialize(componentRenderer: TGlBasicComponentRenderer): void;

    /**
     * Binds the current buffer to `TRANSFORM_FEEDBACK_BUFFER`.
     */
    bindTransform(componentRenderer: TGl2ComponentRenderer, index: number): void;

    /**
     * Binds the current buffer to `ARRAY_BUFFER`.
     */
    bindArray(componentRenderer: TGlBasicComponentRenderer, usage?: GLenum): void;

    /**
     * Like `bind` but with instancing enabled for this attribute.
     */
    bindArrayInstanced(componentRenderer: TGlInstancedComponentRenderer, divisor: number, usage?: GLenum): void;

    /**
     * Reset the state of this attribute. If `OES_vertex_array_object` is enabled or the context is webgl2 this is a no-op.
     * Called after update as part of the update strategy.
     */
    reset(componentRenderer: TGlBasicComponentRenderer): void;

    /**
     * Links this attribute to shared state, such that a change to one attribute results in a change to all attributes.
     */
    link(sharedState: IAttributeState<TArray>): void;

    /**
     * The internal state of the attribute that can be shared, namely the buffer that the attribute points to.
     */
    getSharableState(): IAttributeState<TArray>;
}