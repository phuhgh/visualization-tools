import { ICartesian2dAxisLabelOptions } from "./i-cartesian2d-axis-label-options";

/**
 * @public
 * Provides dirty checking for generating axis config from axis options.
 */
export interface ICartesian2dAxisLabelConfig extends ICartesian2dAxisLabelOptions
{
    isDirty: boolean;
    fontString: string;
    regenerate(dpr: number): void;
}

/**
 * @public
 * {@inheritDoc ICartesian2dAxisLabelConfig}
 */
export class Cartesian2dAxisLabelConfig implements ICartesian2dAxisLabelConfig
{
    public isDirty = true;
    public fontString: string;

    public fontFamilies!: string[];
    public fontSize!: number; // px
    public maxWidth!: number; // px
    public formatNumber!: (value: number) => string;
    public textColor!: number;
    public padding!: number;

    public constructor
    (
        options: ICartesian2dAxisLabelOptions,
    )
    {
        Object.assign(this, options);
        // regenerate must be called to get the correct size
        this.fontString = Cartesian2dAxisLabelConfig.createFontString(this, 0);
    }

    public regenerate(dpr: number): void
    {
        this.fontString = Cartesian2dAxisLabelConfig.createFontString(this, dpr);
        this.isDirty = false;
    }

    private static createFontString(formattingOptions: ICartesian2dAxisLabelConfig, dpr: number): string
    {
        Cartesian2dAxisLabelConfig.tmp[0] = formattingOptions.fontSize * dpr;
        Cartesian2dAxisLabelConfig.tmp[2] = formattingOptions.fontFamilies.join(" ");
        return Cartesian2dAxisLabelConfig.tmp.join("");
    }

    private static tmp = [12, `px "`, "Times new roman", `"`];
}