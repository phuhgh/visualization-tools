import { IEmscriptenWrapper, ILinkedReferenceCounter, IReadonlyVec2, IRefCountedObject, LinkedReferenceCounter, TTypedArray } from "rc-js-util";
import { ICartesian2dUpdateArg } from "../../../update/update-arg/cartesian2d-update-arg";
import { THitTestableSharedInterleavedPoint2dTrait } from "../../../traits/t-hit-testable-shared-interleaved-point-2d-trait";
import { TCartesianSharedQuadTree } from "../../../eventing/cartesian2d-plot-shared-quad-tree";
import { IndexablePointEntityLineHitTester } from "../../hit-test/indexable-point-entity-line-hit-tester";
import { IHitTestComponent, TEntityTrait } from "@visualization-tools/core";
import { ISharedInterleavedPoint2dQuadIndexer } from "./shared-interleaved-point-2d-quad-indexer";
import { IInterleavedLine2dQuadIndexerBindings, SharedInterleavedLine2dQuadIndexerFactory } from "./shared-interleaved-line-2d-quad-indexer-factory";

/**
 * @public
 * Where an entity makes use of shared buffers it can be indexed natively, potentially providing a significant performance boost.
 * Otherwise equivalent to {@link InterleavedLine2dHitTestComponent}.
 */
export class SharedInterleavedLine2dHitTestComponent<TArray extends TTypedArray>
    implements IHitTestComponent<ICartesian2dUpdateArg<TArray>, THitTestableSharedInterleavedPoint2dTrait<TArray>, TCartesianSharedQuadTree<TArray>>,
               IRefCountedObject
{
    public sharedObject: ILinkedReferenceCounter;

    public static createOne<TTypedArrayCtor extends Float32ArrayConstructor | Float64ArrayConstructor>
    (
        emscriptenModule: IEmscriptenWrapper<IInterleavedLine2dQuadIndexerBindings>,
        ctor: TTypedArrayCtor,
    )
        : SharedInterleavedLine2dHitTestComponent<InstanceType<TTypedArrayCtor>>
    {
        const indexer = SharedInterleavedLine2dQuadIndexerFactory.createOne(emscriptenModule, ctor);
        const hitTestComponent = new SharedInterleavedLine2dHitTestComponent(indexer);
        indexer.sharedObject.release();
        return hitTestComponent;
    }

    public constructor
    (
        private readonly indexer: ISharedInterleavedPoint2dQuadIndexer<TArray>,
    )
    {
        this.sharedObject = new LinkedReferenceCounter([indexer.sharedObject]);
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
        this.indexer.addToTree(
            tree,
            entity,
            updateArg.interactionTransforms.dataToInteractiveArea,
            updateArg.userTransform,
        );
    }
}