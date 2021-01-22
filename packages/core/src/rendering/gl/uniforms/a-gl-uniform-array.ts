import { IReadonlyMat2, IReadonlyMat3, IReadonlyMat4, IReadonlyVec2, IReadonlyVec3, IReadonlyVec4 } from "rc-js-util";
import { TGlBasicEntityRenderer } from "../entity-renderer/t-gl-basic-entity-renderer";

/**
 * @public
 * Supported uniform types.
 */
export type TGlUniformArray =
    | IReadonlyVec2<Float32Array>
    | IReadonlyVec3<Float32Array>
    | IReadonlyVec4<Float32Array>
    | IReadonlyMat2<Float32Array>
    | IReadonlyMat3<Float32Array>
    | IReadonlyMat4<Float32Array>
    ;

/**
 * @public
 * Wrapper for webgl uniform.
 */
export abstract class AGlUniformArray<TData extends TGlUniformArray>
{
    public constructor
    (
        public name: string,
        public data: TData,
        protected transpose: boolean = false,
    )
    {
    }

    public abstract bind
    (
        renderer: TGlBasicEntityRenderer,
    )
        : void;

    public initialize
    (
        entityRenderer: TGlBasicEntityRenderer,
    )
        : void
    {
        this.uniformLocation = entityRenderer.context.getUniformLocation(entityRenderer.program, this.name);
    }

    public setData(data: TData): void
    {
        this.data = data;
    }

    protected uniformLocation: WebGLUniformLocation | null = null;
}
