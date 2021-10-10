import { _Map } from "rc-js-util";
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
        const associatedTransforms = this.transforms.get(userTransformId);

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
        const p1 = _Map.initializeGet(this.transforms, userTransformId, () => new Map<ICacheable, TUnknownTransformComponent<TComponentRenderer>>());

        if (!p1.has(transform))
        {
            p1.set(graphicsComponent, transform);
        }
    }

    private transforms = new Map<symbol, WeakMap<ICacheable, TUnknownTransformComponent<TComponentRenderer>>>();
}
