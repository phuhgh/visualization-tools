import { IBinder } from "../generic-binders/i-binder";
import { TUnknownComponentRenderer } from "../t-unknown-component-renderer";

/**
 * @public
 */
export interface ITransformBinderProvider<TBinder extends IBinder<TUnknownComponentRenderer>>
{
    getTransformBinder(): TBinder;
}