import { TUnknownComponentRenderer } from "../../rendering/t-unknown-component-renderer";
import { ICompositeGraphicsComponent, ILinkableCompositeGraphicsComponentFactory } from "./composite-graphics-component";

/**
 * @public
 */
export type TLinkableCompositeGraphicsComponent<TComponentRenderer extends TUnknownComponentRenderer, TUpdateArg, TTraits> =
    & ICompositeGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>
    & ILinkableCompositeGraphicsComponentFactory<TComponentRenderer, TUpdateArg, TTraits>
    ;