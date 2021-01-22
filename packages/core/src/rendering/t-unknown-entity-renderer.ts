import { IBaseEntityRenderer } from "./i-base-entity-renderer";

/**
 * @public
 * Useful where the entity renderer is not important, i.e. draw calls  are not allowed.
 */
export type TUnknownEntityRenderer = IBaseEntityRenderer<unknown, unknown>;