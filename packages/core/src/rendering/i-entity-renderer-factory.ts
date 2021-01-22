import { IBaseEntityRenderer } from "./i-base-entity-renderer";

/**
 * @public
 * Generic factory for creating {@link IBaseEntityRenderer}s for graphics component specifications.
 */
export interface IEntityRendererFactory<TGcSpec, TEntityRenderer extends IBaseEntityRenderer<unknown, unknown>>
{
    createRenderer(specification: TGcSpec): TEntityRenderer;
}