import { TChangeTrackedTrait } from "@visualization-tools/core";

/**
 * @public
 */
export function getTransformChangeId(entity: TChangeTrackedTrait): number
{
    return entity.changeId - Number.MAX_SAFE_INTEGER;
}