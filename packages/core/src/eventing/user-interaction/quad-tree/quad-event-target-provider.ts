import { IPointerEventHitTargetProvider } from "../i-pointer-event-hit-target-provider";
import { IChartPointerEvent } from "../internal-events/chart-pointer-event";
import { IInteractionGroup } from "../../../entities/groups/interaction-group";
import { ISharedEntityQuadTree } from "../../hit-testing/shared-quad-tree/shared-entity-quad-tree";
import { HitTestResult } from "../../hit-testing/hit-test-result";
import { QuadElementSharedObject } from "../../hit-testing/shared-quad-tree/quad-element-shared-object";
import { _Debug, _Map, _Production } from "rc-js-util";
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
        private readonly hitTestableEntities: IInteractionGroup<unknown, ISharedEntityQuadTree<unknown, TTraits>, TTraits>,
        private readonly quadTree: ISharedEntityQuadTree<unknown, TTraits>,
    )
    {
    }

    public hitTestPlot
    (
        pointerEvent: IChartPointerEvent<MouseEvent>,
    )
        : HitTestResult<unknown, TTraits>[]
    {
        const resultCount = this.quadTree.sharedTree.queryPoint(pointerEvent.pointerCssPosition, this.hitTestableEntities.groupMask);
        const entities = this.quadTree.entities;
        const quadTreeResults = this.quadTree.sharedTree.getResults();
        const updateArg = this.quadTree.hitTestArg;
        const hitTestResults = new Map<TEntityTrait<unknown, TTraits>, HitTestResult<unknown, TTraits>>();

        if (updateArg == null)
        {
            _Production.error("updateArg must be set before query");
        }

        for (let i = 0, iEnd = resultCount * QuadElementSharedObject.elementCount; i < iEnd; i += QuadElementSharedObject.elementCount)
        {
            const entity = entities[quadTreeResults[i]];

            DEBUG_MODE && _Debug.assert(entity != null, "failed entity lookup");

            const isHitAllowed = this.hitTestableEntities.hitAllowedComponentStore
                .getComponent(entity)
                .isHitAllowed(entity, pointerEvent, updateArg);

            if (!isHitAllowed)
            {
                continue;
            }

            const dataId = quadTreeResults[i + 1];
            const isHit = this.hitTestableEntities.hitTestableGroup
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