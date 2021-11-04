import { IBaseComponentRenderer } from "./component-renderer/i-base-component-renderer";

/**
 * @public
 * Useful where the component renderer is not important, i.e. draw calls  are not allowed.
 */
export type TUnknownComponentRenderer = IBaseComponentRenderer<unknown, unknown>;