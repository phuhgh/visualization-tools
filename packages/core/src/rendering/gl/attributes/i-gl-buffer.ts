import { TTypedArray } from "rc-js-util";
import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";
import { TGlContext } from "../t-gl-context";

/**
 * @public
 * Dirty checked wrapper of `WebGLBuffer`. Modify via {@link IGlAttribute}.
 */
export interface IGlBuffer<TArray extends TTypedArray>
{
    isDirty: boolean;
    onContextLost(): void;
    initialize(componentRenderer: TGlBasicComponentRenderer): void;
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