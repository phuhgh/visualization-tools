import { IBinder } from "./i-binder";
import { TUnknownComponentRenderer } from "../t-unknown-component-renderer";

/**
 * @public
 * An automatically sharable binder.
 */
export interface ILinkableBinder<TComponentRenderer extends TUnknownComponentRenderer>
    extends IBinder<TComponentRenderer>
{
    link(binders: ILinkableBinder<TComponentRenderer>[]): void;
    /**
     * A unique identifier for this class of linkable binder. The binders must have the same buffer format / layout.
     */
    linkId: string | symbol;
}