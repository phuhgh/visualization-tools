/**
 * @public
 */
export interface IInteractionOptions
{
    /**
     * Providing the option enables double click events.
     */
    doubleClickOptions?: {
        /**
         * Max time between clicks in ms for it to count as a double click.
         *
         * Default 500 ms.
         */
        timeout: number;
        /**
         * How close the second click / tap has to be to the first in pixels.
         *
         * Default 2px.
         */
        maxRadius: number;
    };

    /**
     * Adjusts zoom sensitivity for pinch gesture (\> 0).
     *
     * Default 1.
     */
    pinchZoomSensitivity: number;
}