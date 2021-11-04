import { ILinkableBinder } from "./i-linkable-binder";
import { TUnknownComponentRenderer } from "../t-unknown-component-renderer";

/**
 * @public
 * Components can implement this to indicate that they can automatically share buffers.
 */
export interface ILinkableBinderProvider<TComponentRenderer extends TUnknownComponentRenderer>
{
    getLinkableBinders(): readonly ILinkableBinder<TComponentRenderer>[];
}