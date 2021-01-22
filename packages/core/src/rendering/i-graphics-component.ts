import { IGraphicsComponentSpecification } from "./i-graphics-component-specification";
import { TUnknownEntityRenderer } from "./t-unknown-entity-renderer";

/**
 * @public
 * Base graphics component.
 */
export interface IGraphicsComponent<TEntityRenderer extends TUnknownEntityRenderer, TUpdateArg, TEntityTraits>
    extends IGraphicsComponentSpecification<TEntityRenderer, TUpdateArg, TEntityTraits>
{
}