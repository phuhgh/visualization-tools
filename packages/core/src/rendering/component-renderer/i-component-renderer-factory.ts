import { IBaseComponentRenderer } from "./i-base-component-renderer";

/**
 * @public
 * Generic factory for creating {@link IBaseComponentRenderer}s for graphics component specifications.
 */
export interface IComponentRendererFactory<TGcSpec, TComponentRenderer extends IBaseComponentRenderer<unknown, unknown>>
{
    createRenderer(specification: TGcSpec): TComponentRenderer;
}