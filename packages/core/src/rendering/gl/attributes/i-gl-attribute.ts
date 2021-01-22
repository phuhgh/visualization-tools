import { TGlBasicEntityRenderer } from "../entity-renderer/t-gl-basic-entity-renderer";
import { TTypedArray } from "rc-js-util";
import { TGlInstancedEntityRenderer } from "../entity-renderer/t-gl-instanced-entity-renderer";

/**
 * @public
 * Wrapper for dirty checked GL attributes with VAO and shared mutable buffer support. `ChangeId`s must be generated
 * program wide to avoid collisions `IncrementingIdentifierFactory` (rc-js-util) is a suitable implementation.
 */
export interface IGlAttribute
{
    /**
     * The name of the attribute, must match the shader name exactly.
     */
    readonly name: string;

    /**
     * The size of the attribute
     */
    readonly componentsPerVertex: number;

    /**
     * Set the byte offset into the buffer.
     */
    setOffset(byteOffset: number): void;

    /**
     * Copy new data into the buffer.
     */
    setData(data: TTypedArray, changeId: number): void;

    /**
     * Overwrite data in the buffer. The argument `updateId` is provided to allow multiple writes per draw, if the
     * `updateId` is larger than the previous call's `updateId` then the modification is allowed. This resets whenever
     * `changeId` changes.
     */
    overrideValues
    (
        entityRenderer: TGlBasicEntityRenderer,
        byteOffset: number,
        data: TTypedArray,
        changeId: number,
        updateId: number,
    )
        : void;

    /**
     * Called once on creation or context restored.
     */
    initialize(entityRenderer: TGlBasicEntityRenderer): void;

    /**
     * Wrapper of vertexAttribPointer.
     */
    bind(entityRenderer: TGlBasicEntityRenderer, usage?: GLenum): void;
    /**
     * Like `bind` but with instancing enabled for this attribute.
     */
    bindInstanced(entityRenderer: TGlInstancedEntityRenderer, divisor: number, usage?: GLenum): void;

    /**
     * Reset the state of this attribute. If `OES_vertex_array_object` is enabled or the context is webgl2 this is a no-op.
     * Called after update as part of the update strategy.
     */
    reset(entityRenderer: TGlBasicEntityRenderer): void;
}