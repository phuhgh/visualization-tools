import { IGraphicsComponentSettingsTrait } from "@visualization-tools/core";
import { IReadonlyVec4, Mat4, RgbaColorPacker, TF32Vec4, Vec4 } from "rc-js-util";
import { THighlightColorOverride } from "../indexed-point-2d/i-gl-indexed-point2d-binder";

/**
 * @public
 * Point config where not specified per point.
 */
export class Point2dDisplaySettings extends Mat4.f32
{
    public colorOverrides: THighlightColorOverride[] | null = null;

    public constructor
    (
        pixelSize: number,
        /**
         * RGBA unit32.
         */
        color: number,
        highlightColor: number = color,
    )
    {
        super();
        this.setSize(pixelSize);
        this.setColor(color);
        this.setHighlightColor(highlightColor);
    }

    public setSize(size: number): void
    {
        this[0] = size;
    }

    public setColor(rgbaColor: number): void
    {
        this.setColorImpl(rgbaColor, 4);
    }

    public getColor(): IReadonlyVec4<Float32Array>
    {
        if (this.color == null)
        {
            this.color = new Vec4.f32();
        }

        return this.getRow(1, this.color);
    }

    public setHighlightColor(rgbaColor: number): void
    {
        this.setColorImpl(rgbaColor, 8);
    }

    public getHighlightColor(): IReadonlyVec4<Float32Array>
    {
        if (this.highlight == null)
        {
            this.highlight = new Vec4.f32();
        }

        return this.getRow(2, this.highlight);
    }


    public getPixelSize(): number
    {
        return this[0];
    }

    private setColorImpl(rgbaColor: number, startIndex: 4 | 8): void
    {
        // 0.00392156862745098 = 1 / 255
        this[startIndex] = RgbaColorPacker.unpackR(rgbaColor) * 0.00392156862745098;
        this[startIndex + 1 as 0] = RgbaColorPacker.unpackG(rgbaColor) * 0.00392156862745098;
        this[startIndex + 2 as 0] = RgbaColorPacker.unpackB(rgbaColor) * 0.00392156862745098;
        this[startIndex + 3 as 0] = RgbaColorPacker.unpackA(rgbaColor) * 0.00392156862745098;
    }

    private color: TF32Vec4 | null = null;
    private highlight: TF32Vec4 | null = null;
}

/**
 * @public
 */
export type TPoint2dDisplaySettings = { pointDisplay: Point2dDisplaySettings };

/**
 * @public
 */
export type TPoint2dDisplaySettingsTrait = IGraphicsComponentSettingsTrait<TPoint2dDisplaySettings>;

