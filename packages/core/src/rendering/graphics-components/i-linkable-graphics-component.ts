import { TUnknownComponentRenderer } from "../t-unknown-component-renderer";
import { IGraphicsComponent } from "./i-graphics-component";
import { ILinkableBinderProvider } from "../generic-binders/i-linkable-binder-provider";

/**
 * @public
 * WebGl components may optionally implement this instead of {@link IGraphicsComponent} to indicate that they have linkable
 * attributes. Use in conjunction with {@link ILinkableBinderProvider} is recommended if transforms are used.
 */
export interface ILinkableGraphicsComponent<TComponentRenderer extends TUnknownComponentRenderer
    , TUpdateArg
    , TEntityTraits>
    extends IGraphicsComponent<TComponentRenderer, TUpdateArg, TEntityTraits>,
            ILinkableBinderProvider<TComponentRenderer>
{
}