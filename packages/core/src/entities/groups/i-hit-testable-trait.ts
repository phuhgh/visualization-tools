/**
 * @public
 * An entity that is hit testable.
 */
export interface IHitTestableTrait
{
    hitAllowed?: boolean;
    groupMask: number;
    hitTestId: number;
}