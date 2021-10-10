import { IReadonlyVec2, Range2d, TTypedArray } from "rc-js-util";
import { ICartesian2dUpdateArg } from "../../../update/update-arg/cartesian2d-update-arg";
import { TCartesianSharedQuadTree } from "../../../eventing/cartesian2d-plot-shared-quad-tree";
import { IndexablePointEntityLineHitTester } from "../../hit-test/indexable-point-entity-line-hit-tester";
import { THitTestableIndexedPoint2dTrait } from "../../../traits/t-hit-testable-indexed-point-2d-trait";
import { IHitTestComponent, TEntityTrait } from "@visualization-tools/core";

/**
 * @public
 * Inserts line segments into a shared quad tree from a {@link TIndexedPointTrait}.
 */
export class InterleavedLine2dHitTestComponent<TArray extends TTypedArray>
    implements IHitTestComponent<ICartesian2dUpdateArg<TArray>, THitTestableIndexedPoint2dTrait<TArray>, TCartesianSharedQuadTree<TArray>>
{
    public hitTest
    (
        entity: TEntityTrait<ICartesian2dUpdateArg<TArray>, THitTestableIndexedPoint2dTrait<TArray>>,
        indexOfFirstPoint: number,
        cssPosition: IReadonlyVec2<Float32Array>,
        updateArg: ICartesian2dUpdateArg<TArray>,
    )
        : boolean
    {
        return IndexablePointEntityLineHitTester.hitTestEntity(entity, indexOfFirstPoint, cssPosition, updateArg);
    }

    public index
    (
        entity: TEntityTrait<ICartesian2dUpdateArg<TArray>, THitTestableIndexedPoint2dTrait<TArray>>,
        updateArg: ICartesian2dUpdateArg<TArray>,
        entityTree: TCartesianSharedQuadTree<TArray>,
    )
        : void
    {
        const aabb = InterleavedLine2dHitTestComponent.aabb;
        const connector = entity.data;
        const xOffset = entity.data.offsets.x;
        const yOffset = entity.data.offsets.y;
        const groupMask = entity.groupMask;
        const entityId = entity.hitTestId;

        for (let i = connector.getStart(), iEnd = connector.getEnd() - 1; i < iEnd; ++i)
        {
            aabb[0] = updateArg.interactionTransforms.dataToInteractiveArea.getVec3MultiplyX(connector.getValue(i, xOffset));
            aabb[1] = updateArg.interactionTransforms.dataToInteractiveArea.getVec3MultiplyX(connector.getValue(i + 1, xOffset));
            aabb[2] = updateArg.interactionTransforms.dataToInteractiveArea.getVec3MultiplyY(connector.getValue(i, yOffset));
            aabb[3] = updateArg.interactionTransforms.dataToInteractiveArea.getVec3MultiplyY(connector.getValue(i + 1, yOffset));
            aabb.ensureAABB();

            entityTree.sharedTree.addBoundingBox(aabb, entityId, i, groupMask);
        }
    }

    private static aabb = new Range2d.f32();
}