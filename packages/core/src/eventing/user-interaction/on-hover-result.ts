import { HitTestResult } from "../hit-testing/hit-test-result";

/**
 * @public
 */
export interface IOnHoverResult<TTraits>
{
    readonly newlyHovered: readonly HitTestResult<unknown, TTraits>[];
    readonly stillHovered: readonly HitTestResult<unknown, TTraits>[];
    readonly noLongerHovered: readonly HitTestResult<unknown, TTraits>[];
    readonly unchanged: readonly HitTestResult<unknown, TTraits>[];
}

/**
 * @public
 */
export class OnHoverResult<TTraits> implements IOnHoverResult<TTraits>
{
    public constructor
    (
        public readonly newlyHovered: readonly HitTestResult<unknown, TTraits>[],
        public readonly stillHovered: readonly HitTestResult<unknown, TTraits>[],
        public readonly noLongerHovered: readonly HitTestResult<unknown, TTraits>[],
        public readonly unchanged: readonly HitTestResult<unknown, TTraits>[],
    )
    {
    }
}