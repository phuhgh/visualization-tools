/**
 * @public
 * User options for axis settings in cartesian 2d plots.
 */
export interface ICartesian2dAxisLabelOptions
{
    fontFamilies: string[];
    fontSize: number; // px
    maxWidth: number; // px
    formatNumber: (value: number) => string;
    /**
     * Bit packed RGBA, 8 bits per channel.
     */
    textColor: number;
    padding: number;
}
