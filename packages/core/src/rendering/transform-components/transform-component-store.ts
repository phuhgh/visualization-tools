import { _Map, DirtyCheckedUniqueCollection } from "rc-js-util";
import { TUnknownTransformComponent } from "./t-unknown-transform-component";
import { ICacheable } from "../i-cacheable";
import { IBaseComponentRenderer } from "../component-renderer/i-base-component-renderer";

/**
 * @public
 * A store for transform components (feedback transforms in wgl).
 */
export interface ITransformComponentStore<TComponentRenderer extends IBaseComponentRenderer<unknown, unknown>>
{
    setTransform(userTransformId: symbol, graphicsComponent: ICacheable, transform: TUnknownTransformComponent<TComponentRenderer>): void;
    getTransform(userTransformId: symbol, graphicsComponent: ICacheable): TUnknownTransformComponent<TComponentRenderer> | undefined;
    getAllTransforms(): readonly TUnknownTransformComponent<TComponentRenderer>[];
}

/**
 * @public
 * {@inheritDoc ITransformComponentStore}
 */
export class TransformComponentStore<TComponentRenderer extends IBaseComponentRenderer<unknown, unknown>>
    implements ITransformComponentStore<TComponentRenderer>
{
    public getTransform
    (
        userTransformId: symbol,
        graphicsComponent: ICacheable,
    )
        : TUnknownTransformComponent<TComponentRenderer> | undefined
    {
        const associatedTransforms = this.transformsById.get(userTransformId);

        if (associatedTransforms == null)
        {
            return undefined;
        }

        return associatedTransforms.get(graphicsComponent);
    }

    public setTransform
    (
        userTransformId: symbol,
        graphicsComponent: ICacheable,
        transform: TUnknownTransformComponent<TComponentRenderer>,
    )
        : void
    {
        const p1 = _Map.initializeGet(this.transformsById, userTransformId, () => new Map<ICacheable, TUnknownTransformComponent<TComponentRenderer>>());

        if (!p1.has(transform))
        {
            p1.set(graphicsComponent, transform);
        }

        this.transforms.add(transform);
    }

    public getAllTransforms(): readonly TUnknownTransformComponent<TComponentRenderer>[]
    {
        return this.transforms.getArray();
    }

    private transformsById = new Map<symbol, WeakMap<ICacheable, TUnknownTransformComponent<TComponentRenderer>>>();
    private transforms = new DirtyCheckedUniqueCollection<TUnknownTransformComponent<TComponentRenderer>>();
}
