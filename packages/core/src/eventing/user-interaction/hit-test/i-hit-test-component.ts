import { IReadonlyVec2 } from "rc-js-util";
import { TEntityTrait } from "../../../entities/traits/t-entity-trait";
import { IHitTestableTrait } from "../../../entities/groups/i-hit-testable-trait";

/**
 * @public
 * A component to test if an entity is under the cursor / finger.
 */
export interface IHitTestComponent<TUpdateArg, TTraits extends IHitTestableTrait, TComponentState>
{
    /**
     * Perform the test.
     * @param entity - The entity to test.
     * @param dataId - The segment id of the entity, specific to the data connector.
     * @param position - The position of the cursor in css space.
     * @param updateArg - Specific to the current plot type.
     * @returns true if under the cursor.
     */
    hitTest
    (
        entity: TEntityTrait<TUpdateArg, TTraits>,
        dataId: number,
        position: IReadonlyVec2<Float32Array>,
        updateArg: TUpdateArg,
    )
        : boolean;

    /**
     * Where a hit test requires generating / modifying a data structure, this can be done here.
     * @param entity - The entity to index.
     * @param updateArg - Specific to the current plot type.
     * @param componentState - The data structure to update.
     */
    index
    (
        entity: TEntityTrait<TUpdateArg, TTraits>,
        updateArg: TUpdateArg,
        componentState: TComponentState,
    )
        : void;
}
