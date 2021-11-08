import { _Array, IRefCountedObject, TTypedArrayCtor } from "rc-js-util";
import { Point2dSubcategory } from "@visualization-tools/cartesian-2d";
import { TPointEntity } from "./t-point-entity";
import { IHitTestableTrait, IHitTestComponent } from "@visualization-tools/core";

export class PointEntityCollection<TArrayCtor extends TTypedArrayCtor, TTraits>
{
    public constructor
    (
        public readonly entities: readonly TPointEntity<TArrayCtor>[],
        public readonly pointSubcategory: Point2dSubcategory<InstanceType<TArrayCtor>>,
        public readonly hitTestComponent: IHitTestComponent<unknown, IHitTestableTrait, unknown> & Partial<IRefCountedObject>,
    )
    {
    }

    public release(): void
    {
        if (this.hitTestComponent.sharedObject != null)
        {
            this.hitTestComponent.sharedObject.release();
        }

        _Array.forEach(this.entities, entity => entity.data.sharedObject.release());
    }
}