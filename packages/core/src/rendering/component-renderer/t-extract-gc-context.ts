import { IBaseComponentRenderer } from "./i-base-component-renderer";

/**
 * @public
 */
export type TExtractGcContext<TComponentRenderer extends IBaseComponentRenderer<unknown, unknown>> = TComponentRenderer["context"];