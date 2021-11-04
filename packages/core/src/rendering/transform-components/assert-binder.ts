import { _Debug } from "rc-js-util";
import { IBinder } from "../generic-binders/i-binder";
import { TUnknownComponentRenderer } from "../t-unknown-component-renderer";

/**
 * @public
 * debug utility for checking binder type in graphics / transform component.
 */
export function assertBinder(binder: IBinder<TUnknownComponentRenderer>, id: symbol): void
{
    DEBUG_MODE && _Debug.assert(binder.binderClassificationId === id, `binder does not match interface, asked for "${id.toString()}" but got "${binder.binderClassificationId.toString()}"`);
}