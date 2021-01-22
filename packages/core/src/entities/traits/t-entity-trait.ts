import { IChartEntity } from "../chart-entity";

/**
 * @public
 * Base entity with additional trait.
 */
export type TEntityTrait<TUpdateArg, TTraits> =
    & IChartEntity<TUpdateArg>
    & TTraits
    ;