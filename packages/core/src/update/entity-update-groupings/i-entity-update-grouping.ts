import { TEntityTrait } from "../../entities/traits/t-entity-trait";

/**
 * @public
 * A grouping graphics components (and optionally transforms) ready to draw.
 */
export interface IEntityUpdateGrouping<TUpdateArg, TRequiredTraits>
{
    drawUpdateGroup
    (
        entities: TEntityTrait<TUpdateArg, TRequiredTraits>[],
        updateArg: TUpdateArg,
    )
        : void;
}