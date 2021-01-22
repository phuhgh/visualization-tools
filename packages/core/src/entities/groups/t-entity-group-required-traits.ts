import { IEntityGroup } from "./a-entity-group";

/**
 * @public
 */
export type TEntityGroupRequiredTraits<T extends IEntityGroup<unknown, unknown>> = T["TTypeRequiredTrait"];