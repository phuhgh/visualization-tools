import { _Set, IEmscriptenWrapper, IReferenceCountedPtr, ISharedObject } from "rc-js-util";
import { ISharedQuadTree, ISharedQuadTreeBindings, SharedQuadTree } from "./shared-quad-tree";
import { IHitTestableTrait } from "../../entities/groups/i-hit-testable-trait";
import { TEntityTrait } from "../../entities/traits/t-entity-trait";

/**
 * @public
 * Wrapper of {@link ISharedQuadTree}. Passing the hit test doesn't guarantee that the pointer is within the AABB,
 * an additional check should be made in the {@link IHitTestComponent}.
 */
export interface ISharedEntityQuadTree<TUpdateArg, TTraits extends IHitTestableTrait> extends ISharedObject
{
    readonly hitTestArg: TUpdateArg | null;
    readonly entities: TEntityTrait<TUpdateArg, TTraits>[];
    readonly sharedTree: ISharedQuadTree<Float32Array>;

    update(hitTestArg: TUpdateArg): void;
    addEntity(entity: TEntityTrait<TUpdateArg, TTraits>): void;
    removeEntity(entity: TEntityTrait<TUpdateArg, TTraits>): void;
}

/**
 * @public
 * {@inheritDoc ISharedEntityQuadTree}
 */
export class SharedEntityQuadTree<TUpdateArg, TTraits extends IHitTestableTrait> implements ISharedEntityQuadTree<TUpdateArg, TTraits>
{
    public hitTestArg: TUpdateArg | null = null;
    public entities: TEntityTrait<TUpdateArg, TTraits>[] = [];
    public readonly sharedObject: IReferenceCountedPtr;
    public readonly sharedTree: ISharedQuadTree<Float32Array>;

    public constructor
    (
        wrapper: IEmscriptenWrapper<ISharedQuadTreeBindings>,
        maxDepth: number,
        maxElementsPerNode: number,
    )
    {
        this.sharedTree = SharedQuadTree.createOneF32(wrapper, maxDepth, maxElementsPerNode);
        this.sharedObject = this.sharedTree.sharedObject;
    }

    public update(hitTestArg: TUpdateArg): void
    {
        this.hitTestArg = hitTestArg;

        if (this.isDirty)
        {
            this.regenerateIds();
        }
    }

    public addEntity(entity: TEntityTrait<TUpdateArg, TTraits>): void
    {
        this.uniqueEntities.add(entity);
        this.isDirty = true;
    }

    public removeEntity(entity: TEntityTrait<TUpdateArg, TTraits>): void
    {
        this.uniqueEntities.delete(entity);
        this.isDirty = true;
    }

    private regenerateIds(): void
    {
        const uniqueEntities = this.uniqueEntities;
        const entities = this.entities = _Set.valuesToArray(uniqueEntities);

        for (let i = 0, iEnd = entities.length; i < iEnd; ++i)
        {
            entities[i].hitTestId = i;
        }

        this.isDirty = false;
    }

    private uniqueEntities = new Set<TEntityTrait<TUpdateArg, TTraits>>();
    private isDirty = true;
}