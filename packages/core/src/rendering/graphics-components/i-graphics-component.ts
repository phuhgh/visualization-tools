import { IGraphicsComponentSpecification } from "./i-graphics-component-specification";
import { TUnknownComponentRenderer } from "../t-unknown-component-renderer";
import { ITransformProvider } from "../transform-components/i-transform-provider";
import { EGraphicsComponentType } from "./e-graphics-component-type";

/**
 * @public
 * Base graphics component.
 */
export interface IGraphicsComponent<TComponentRenderer extends TUnknownComponentRenderer, TUpdateArg, TEntityTraits>
    extends IGraphicsComponentSpecification<TComponentRenderer>
{
    // FIXME: groupId must be extracted, it is usage dependent (conflicts with one gc instance per usage category)
    readonly transform: ITransformProvider<TUnknownComponentRenderer, TUpdateArg, TEntityTraits>;
    readonly type: EGraphicsComponentType.Entity;

    initialize(componentRenderer: TComponentRenderer): void;

    /**
     * Invariant by entity for a given frame, called either once or entity count times before update, depending
     * on update strategy.
     */
    onBeforeUpdate
    (
        componentRenderer: TComponentRenderer,
        updateArg: TUpdateArg,
    )
        : void;

    /**
     * Called once per entity per frame.
     */
    update
    (
        entity: TEntityTraits,
        componentRenderer: TComponentRenderer,
        updateArg: TUpdateArg,
    )
        : void;
}
