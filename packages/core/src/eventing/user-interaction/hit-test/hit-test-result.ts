import { TEntityTrait } from "../../../entities/traits/t-entity-trait";

/**
 * @public
 * An entity that user has interacted with.
 */
export class HitTestResult<TUpdateArg, TTraits>
{
    public constructor
    (
        public entity: TEntityTrait<TUpdateArg, TTraits>,
        /**
         * The segments of the entity that passed the hit test.
         */
        public segmentIds: Set<number>,
        /**
         * The update arg.
         */
        public hitTestArg: TUpdateArg,
        /**
         * Additional filtering, typically the group mask.
         */
        public filterMask: number,
    )
    {
    }
}