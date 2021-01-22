import { IReadonlyVec2, TTypedArray } from "rc-js-util";
import { ICartesian2dUpdateArg } from "../../../update/cartesian2d-update-arg";
import { THitTestableSharedInterleavedPoint2dTrait } from "../../../traits/t-hit-testable-shared-interleaved-point-2d-trait";
import { TCartesianSharedQuadTree } from "../../../eventing/cartesian2d-plot-shared-quad-tree";
import { IndexablePointEntityLineHitTester } from "../../hit-test/indexable-point-entity-line-hit-tester";
import { IHitTestComponent, TEntityTrait } from "@visualization-tools/core";
import { ISharedInterleavedPoint2dQuadIndexer } from "./shared-interleaved-point-2d-quad-indexer";

/**
 * @public
 * Where an entity makes use of shared buffers it can be indexed natively, potentially providing a significant performance boost.
 * Otherwise equivalent to {@link InterleavedLine2dHitTestComponent}.
 */
export class SharedInterleavedPoint2dHitTestComponent<TArray extends TTypedArray>
    implements IHitTestComponent<ICartesian2dUpdateArg<TArray>, THitTestableSharedInterleavedPoint2dTrait<TArray>, TCartesianSharedQuadTree<TArray>>
{
    public constructor
    (
        private readonly indexer: ISharedInterleavedPoint2dQuadIndexer<TArray>,
    )
    {
    }

    public hitTest
    (
        entity: TEntityTrait<ICartesian2dUpdateArg<TArray>, THitTestableSharedInterleavedPoint2dTrait<TArray>>,
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
        entity: TEntityTrait<ICartesian2dUpdateArg<TArray>, THitTestableSharedInterleavedPoint2dTrait<TArray>>,
        updateArg: ICartesian2dUpdateArg<TArray>,
        tree: TCartesianSharedQuadTree<TArray>,
    )
        : void
    {
        this.indexer.update(tree, entity, updateArg.interactionTransforms.dataToInteractiveArea);
    }
}