/**
 * @public
 * These are set for the whole chart as opposed to per plot.
 */
export interface IChartWideInteractionOptions
{
    /**
     * A contextmenu event will be emitted on long tap, prevent the default with this.
     *
     * Default true.
     */
    disableLongPressContext: boolean;

    /**
     * Scroll wheel will scroll page by default, set true to prevent this and zoom instead.
     *
     * Default true.
     */
    scrollZooms: boolean;

    /**
     * Default false
     */
    disableAllInteraction: boolean;
}