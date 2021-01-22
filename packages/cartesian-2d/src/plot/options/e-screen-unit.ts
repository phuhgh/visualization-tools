/**
 * @public
 * Supported methods of describing screen space dimensions.
 */
export enum EScreenUnit
{
    /**
     * Clip space.
     */
    Clip = 1,
    /**
     * Screen space.
     */
    ActualPixel,
    /**
     * Css screen space (equal to `ActualPixel` / `DPR`).
     */
    CssPixel,
}
