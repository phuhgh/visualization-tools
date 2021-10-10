import { IBaseComponentRenderer } from "./i-base-component-renderer";

/**
 * @public
 */
export type TExtractGcSpec<TComponentRenderer extends IBaseComponentRenderer<unknown, unknown>> = TComponentRenderer["specification"];