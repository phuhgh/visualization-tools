import { IBaseEntityRenderer } from "./i-base-entity-renderer";

/**
 * @public
 */
export type TExtractGcContext<TEntityRenderer extends IBaseEntityRenderer<unknown, unknown>> = TEntityRenderer["context"];