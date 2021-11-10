import { IBinder } from "./i-binder";
import { TUnknownComponentRenderer } from "../t-unknown-component-renderer";

/**
 * @public
 */
export interface ITransformBinder<TComponentRenderer extends TUnknownComponentRenderer>
    extends IBinder<TComponentRenderer>
{
    getTransformId(): string;
    resetState(): void;
}
