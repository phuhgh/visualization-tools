import { TTypedArray } from "rc-js-util";
import { TGlContext } from "../t-gl-context";
import { IBuffer } from "../../buffers/i-buffer";

/**
 * @public
 * Dirty checked wrapper of `WebGLBuffer`. Modify via {@link IGlAttribute}.
 */
export interface IGlBuffer<TArray extends TTypedArray> extends IBuffer
{
    readonly isDirty: boolean;
    readonly changeId: number;

    onContextLost(): void;
    initialize(context: TGlContext): void;
    destroy(context: TGlContext): void;
    setSize
    (
        context: WebGL2RenderingContext,
        byteSize: number,
        usage: GLenum,
        changeId: number,
    )
        : void;
    setData(data: TArray, changeId: number): void;
    bindArray(context: TGlContext, usage: GLenum): void;
    bindTransform(context: WebGL2RenderingContext, index: number): void;
    getSubBufferData(context: WebGL2RenderingContext, result: TArray): TArray;
    /**
     * For a given `changeId` multiple writes are allowed where the `modificationId` is greater than the previous value.
     * Every time `changeId` changes this is reset.
     *
     * @remarks
     * Allows multiple components to share buffers without knowing about it, avoiding unnecessary writes which could
     * be blocking.
     */
    setSubBufferData
    (
        context: TGlContext,
        byteOffset: number,
        data: TArray,
        changeId: number,
        modificationId: number,
    )
        : void;
}