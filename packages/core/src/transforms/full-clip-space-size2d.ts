import { IReadonlyRange2d, Range2d } from "rc-js-util";

/**
 * @public
 */
export const fullClipSpaceSize2d: IReadonlyRange2d<Float32Array> = Range2d.f32.factory.createOne(0, 2, 0, 2);