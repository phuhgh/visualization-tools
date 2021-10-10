import { TUnknownComponentRenderer } from "../../t-unknown-component-renderer";
import { ITransformComponent } from "../../transform-components/i-transform-component";

/**
 * @public
 */
export interface IGlTransformComponent<TComponentRenderer extends TUnknownComponentRenderer
    , TBinder
    , TUpdateArg
    , TEntityTraits>
    extends ITransformComponent<TComponentRenderer, TUpdateArg, TEntityTraits>
{
    setOutputBuffers(entity: TEntityTraits, binder: TBinder, transformRenderer: TComponentRenderer): void;
}
