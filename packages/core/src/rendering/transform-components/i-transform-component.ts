import { IGraphicsComponentSpecification } from "../graphics-components/i-graphics-component-specification";
import { TUnknownComponentRenderer } from "../t-unknown-component-renderer";

/**
 * @public
 */
export interface ITransformComponent<TTransformRenderer extends TUnknownComponentRenderer
    , TUpdateArg
    , TEntityTraits>
    extends IGraphicsComponentSpecification<TTransformRenderer>
{
    initialize(componentRenderer: TTransformRenderer): void;
    performTransform(entity: TEntityTraits, transformRenderer: TTransformRenderer, updateParameter: TUpdateArg): void;
}
