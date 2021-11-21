import { IPointerEventHitTargetProvider } from "../i-pointer-event-hit-target-provider";
import { IChartPointerEvent } from "../internal-events/chart-pointer-event";
import { IInteractionGroup } from "../../../entities/groups/interaction-group";
import { ISharedEntityQuadTree } from "../../hit-testing/shared-quad-tree/shared-entity-quad-tree";
import { HitTestResult } from "../../hit-testing/hit-test-result";
import { QuadElementSharedObject } from "../../hit-testing/shared-quad-tree/quad-element-shared-object";
import { _Array, _Debug, _Map } from "rc-js-util";
import { TEntityTrait } from "../../../entities/traits/t-entity-trait";
import { IHitTestableTrait } from "../../../entities/groups/i-hit-testable-trait";

/**
 * @public
 * Wrapper of {@link ISharedEntityQuadTree}, maps pointer events to entities.
 */
export class QuadEventTargetProvider<TTraits extends IHitTestableTrait>
    implements IPointerEventHitTargetProvider<unknown, TTraits>
{
    public constructor
    (
        private readonly hitTestableGroup: IInteractionGroup<unknown, ISharedEntityQuadTree<unknown, TTraits>, TTraits>,
        private readonly quadTree: ISharedEntityQuadTree<unknown, TTraits>,
    )
    {
    }

    public hitTestPlot
    (
        pointerEvent: IChartPointerEvent<MouseEvent>,
    )
        : readonly HitTestResult<unknown, TTraits>[]
    {
        const updateArg = this.quadTree.hitTestArg;

        if (updateArg == null)
        {
            // Possible for queries to come in during the initial rollup period
            return _Array.emptyArray;
        }

        const hitTestableGroup = this.hitTestableGroup;
        const resultCount = this.quadTree.sharedTree.queryPoint(pointerEvent.pointerCssPosition, hitTestableGroup.groupMask);
        const entities = this.quadTree.entities;
        const quadTreeResults = this.quadTree.sharedTree.getResults();
        const hitTestResults = new Map<TEntityTrait<unknown, TTraits>, HitTestResult<unknown, TTraits>>();

        for (let i = 0, iEnd = resultCount * QuadElementSharedObject.elementCount; i < iEnd; i += QuadElementSharedObject.elementCount)
        {
            const entity = entities[quadTreeResults[i]];

            DEBUG_MODE && _Debug.assert(entity != null, "failed entity lookup");

            if (!hitTestableGroup.isEntityInGroup(entity))
            {
                // it's possible that the entity was removed from the group after the tree was created
                // invalidating the tree for a removal would be needlessly expensive (regenerate), so just filter them out
                continue;
            }

            const isHitAllowed = hitTestableGroup.hitAllowedComponentStore
                .getComponent(entity)
                .isHitAllowed(entity, pointerEvent, updateArg);

            if (!isHitAllowed)
            {
                continue;
            }

            const dataId = quadTreeResults[i + 1];
            const isHit = hitTestableGroup.hitTestableGroup
                .getHitTester(entity)
                .hitTest(entity, dataId, pointerEvent.pointerCssPosition, updateArg);

            if (!isHit)
            {
                continue;
            }

            const hitTestResult = hitTestResults.get(entity);

            if (hitTestResult == null)
            {
                const segments = new Set<number>();
                segments.add(dataId);
                hitTestResults.set(entity, new HitTestResult(entity, segments, updateArg, quadTreeResults[i + 2]));
            }
            else
            {
                hitTestResult.segmentIds.add(dataId);
            }
        }

        return _Map.valuesToArray(hitTestResults);
    }
}