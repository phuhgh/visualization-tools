/**
 * @public
 */
export interface ICartesian2dTraceOptions
{
    /**
     * Bit packed RGBA, 8 bits per channel.
     */
    traceColor: number;
    /**
     * The maximum number of vertical / horizontal trace lines (per axis).
     */
    maxTraceCount: number;
    /**
     * In screen pixels.
     */
    traceLinePixelSize: number;
}
