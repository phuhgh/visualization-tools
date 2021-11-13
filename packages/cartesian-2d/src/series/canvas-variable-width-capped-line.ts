import { IReadonlyVec4, RgbaColorPacker, TF64Vec2, Vec2 } from "rc-js-util";
import { Context2dRenderUtil } from "./context2d-render-util";

/**
 * @public
 */
export interface ICanvasCappedLineValueProvider
{
    fallbackColor: number;
    setPosition(toSet: TF64Vec2, x: number, y: number): void;
    getSize(size: number): number;
}

// FIXME this should probably take dom strings instead of packed colors
/**
 * @public
 */
export class CanvasVariableWidthCappedLine
{
    public constructor
    (
        private valueProvider: ICanvasCappedLineValueProvider,
    )
    {
    }

    /**
     * Begins a multi-segment line of variable width, call initialize with the first 2 points first.
     */
    public beginLine(context: CanvasRenderingContext2D, p1: IReadonlyVec4<Float64Array>, p2: IReadonlyVec4<Float64Array>): void
    {
        this.valueProvider.setPosition(this.p1, p1.getX(), p1.getY());
        this.valueProvider.setPosition(this.p2, p2.getX(), p2.getY());
        this.p1Display.update(this.valueProvider.getSize(p1.getZ()), p1.getW());
        this.p2Display.update(this.valueProvider.getSize(p2.getZ()), p2.getW());
        Context2dRenderUtil.getLineNormal(this.p1, this.p2, this.l1Normal);
        context.lineWidth = 1;

        context.beginPath();
        Context2dRenderUtil.moveTo(context, this.p1, this.l1Normal, -this.p1Display[0]);
        Context2dRenderUtil.lineTo(context, this.p1, this.l1Normal, this.p1Display[0]);
    }

    /**
     * This must stop 1 short of the end of the line (i.e. leave one point), this is because it would otherwise
     * attempt to compute a normal for a line that doesn't exist (to generate a non existent cap).
     */
    public setMidPoint(context: CanvasRenderingContext2D, x: number, y: number, size: number, packedColor: number): void
    {
        this.endSegment(context, x, y, size, packedColor);

        Context2dRenderUtil.moveTo(context, this.p2, this.cap, -this.p2Display[0]);
        Context2dRenderUtil.lineTo(context, this.p2, this.cap, this.p2Display[0]);

        this.performSwitcheroo();
    }

    /**
     * closes out the multi-segment line.
     */
    public endLine(context: CanvasRenderingContext2D, lastX: number, lastY: number, lastSize: number, lastPackedColor: number): void
    {
        // finish off the second to last line
        this.endSegment(context, lastX, lastY, lastSize, lastPackedColor);

        // draw the final segment
        Context2dRenderUtil.moveTo(context, this.p2, this.cap, -this.p2Display[0]);
        Context2dRenderUtil.lineTo(context, this.p2, this.cap, this.p2Display[0]);
        CanvasVariableWidthCappedLine.fillGap(context, this.p2Display[1]);
        Context2dRenderUtil.lineTo(context, this.p1, this.l2Normal, this.p1Display[0]);
        Context2dRenderUtil.lineTo(context, this.p1, this.l2Normal, -this.p1Display[0]);
        Context2dRenderUtil.closeMidSegment(context, this.p2Display[1]);
    }

    private endSegment(context: CanvasRenderingContext2D, x: number, y: number, size: number, packedColor: number)
    {
        // the color from the first point is used for the line color
        const lineColor = this.p1Display[1];
        CanvasVariableWidthCappedLine.fillGap(context, lineColor);

        // make p1 into the next point (p3), can do this in place as we don't need it anymore
        this.valueProvider.setPosition(this.p1, x, y);
        this.p1Display.update(this.valueProvider.getSize(size), packedColor);

        Context2dRenderUtil.getLineNormal(this.p2, this.p1, this.l2Normal);
        Context2dRenderUtil.normalizedAddition(this.l1Normal, this.l2Normal, this.cap);

        Context2dRenderUtil.lineTo(context, this.p2, this.cap, this.p2Display[0]);
        Context2dRenderUtil.lineTo(context, this.p2, this.cap, -this.p2Display[0]);
        Context2dRenderUtil.closeMidSegment(context, lineColor);
    }

    private performSwitcheroo(): void
    {
        // retain the objects
        const pTmp = this.p2;
        this.p2 = this.p1;
        this.p1 = pTmp;

        const dTmp = this.p2Display;
        this.p2Display = this.p1Display;
        this.p1Display = dTmp;

        const lTmp = this.l1Normal;
        this.l1Normal = this.l2Normal;
        this.l2Normal = lTmp;
    }

    private static fillGap(context: CanvasRenderingContext2D, lineColor: number): void
    {
        // depending on the layout there may be a aliasing gap, fill it with a 1 px line...
        context.strokeStyle = RgbaColorPacker.makeDomColorString(lineColor);
        context.stroke();
    }

    private p1 = new Vec2.f64();
    private p2 = new Vec2.f64();
    private p1Display = new Vec2.f64();
    private p2Display = new Vec2.f64();
    private l1Normal = new Vec2.f64();
    private l2Normal = new Vec2.f64();
    private cap = new Vec2.f64();
}