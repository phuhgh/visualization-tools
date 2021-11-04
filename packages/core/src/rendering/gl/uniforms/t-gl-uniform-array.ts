import { IReadonlyMat2, IReadonlyMat3, IReadonlyMat4, IReadonlyVec2, IReadonlyVec3, IReadonlyVec4 } from "rc-js-util";

/**
 * @public
 * Supported uniform types.
 */
export type TGlUniformArray =
    | IReadonlyVec2<Float32Array | Int32Array>
    | IReadonlyVec3<Float32Array | Int32Array>
    | IReadonlyVec4<Float32Array | Int32Array>
    | IReadonlyMat2<Float32Array | Int32Array>
    | IReadonlyMat3<Float32Array | Int32Array>
    | IReadonlyMat4<Float32Array | Int32Array>
    ;