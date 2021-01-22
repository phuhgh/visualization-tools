import { IBaseEntityRenderer } from "./i-base-entity-renderer";

/**
 * @public
 */
export type TExtractGcSpec<TEntityRenderer extends IBaseEntityRenderer<unknown, unknown>> = TEntityRenderer["specification"];