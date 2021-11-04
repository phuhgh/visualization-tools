import { RgbaColorPacker, TTypedArray, Vec2 } from "rc-js-util";

/**
 * @public
 * Utilities to try to make Canvas2D more civilized to use.
 */
export class Context2dRenderUtil
{
    /**
     * Add to vectors `a` and `b` and normalize the result to unit length.
     */
    public static normalizedAddition<TArray extends TTypedArray>
    (
        a: Vec2<TArray>,
        b: Vec2<TArray>,
        result: Vec2<TArray>,
    )
        : Vec2<TArray>
    {
        return a
            .add(b, Context2dRenderUtil.tmp)
            .normalize(result);
    }

    /**
     * Returns unit vector perpendicular to the line formed by AB.
     */
    public static getLineNormal<TArray extends TTypedArray>
    (
        p1: Vec2<TArray>,
        p2: Vec2<TArray>,
        result: Vec2<TArray>,
    )
        : Vec2<TArray>
    {
        return p2
            .subtract(p1, Context2dRenderUtil.tmp)
            .normalize(Context2dRenderUtil.tmp)
            .getNormal(result);
    }

    public static moveTo<TArray extends TTypedArray>
    (
        context: CanvasRenderingContext2D,
        vec: Vec2<TArray>,
        offset: Vec2<TArray>,
        scaleFactor: number,
    )
        : void
    {
        offset.scalarMultiply(scaleFactor, Context2dRenderUtil.tmp);
        vec.add(Context2dRenderUtil.tmp, Context2dRenderUtil.tmp);
        context.moveTo(Context2dRenderUtil.tmp.getX(), Context2dRenderUtil.tmp.getY());
    }

    public static lineTo<TArray extends TTypedArray>
    (
        context: CanvasRenderingContext2D,
        vec: Vec2<TArray>,
        offset: Vec2<TArray>,
        scaleFactor: number,
    )
        : void
    {
        offset.scalarMultiply(scaleFactor, Context2dRenderUtil.tmp);
        vec.add(Context2dRenderUtil.tmp, Context2dRenderUtil.tmp);
        context.lineTo(Context2dRenderUtil.tmp.getX(), Context2dRenderUtil.tmp.getY());
    }

    public static closeMidSegment
    (
        context: CanvasRenderingContext2D,
        packedColor: number,
    )
        : void
    {
        context.fillStyle = RgbaColorPacker.makeDomColorString(packedColor);
        context.fill();
        context.beginPath();
    }

    private static tmp = new Vec2.f64();
}