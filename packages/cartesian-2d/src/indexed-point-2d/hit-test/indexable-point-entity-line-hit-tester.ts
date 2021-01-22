import { IReadonlyVec2, TTypedArray, Vec2 } from "rc-js-util";
import { ICartesian2dUpdateArg } from "../../update/cartesian2d-update-arg";
import { THitTestableIndexedPoint2dTrait } from "../../traits/t-hit-testable-indexed-point-2d-trait";
import { TEntityTrait } from "@visualization-tools/core";

/**
 * @internal
 * Hit tests a 2d line, assuming linear interpolation of size and excluding any cap.
 */
export class IndexablePointEntityLineHitTester
{
    /**
     * @returns true if the cssPosition is within the line. Does not consider line caps.
     */
    public static hitTestEntity<TArray extends TTypedArray>
    (
        entity: TEntityTrait<ICartesian2dUpdateArg<TArray>, THitTestableIndexedPoint2dTrait<TArray>>,
        indexOfFirstPoint: number,
        cssPosition: IReadonlyVec2<Float32Array>,
        updateArg: ICartesian2dUpdateArg<TArray>,
    )
        : boolean
    {
        const xOffset = entity.data.offsets.x;
        const yOffset = entity.data.offsets.y;

        const dataTransform = updateArg.interactionTransforms.dataToInteractiveArea;
        IndexablePointEntityLineHitTester.a.update(
            dataTransform.getVec3MultiplyX(entity.data.getValue(indexOfFirstPoint, xOffset)),
            dataTransform.getVec3MultiplyY(entity.data.getValue(indexOfFirstPoint, yOffset)),
        );
        IndexablePointEntityLineHitTester.b.update(
            dataTransform.getVec3MultiplyX(entity.data.getValue(indexOfFirstPoint + 1, xOffset)),
            dataTransform.getVec3MultiplyY(entity.data.getValue(indexOfFirstPoint + 1, yOffset)),
        );
        const ap = cssPosition.subtract(IndexablePointEntityLineHitTester.a, IndexablePointEntityLineHitTester.ap);
        const bp = cssPosition.subtract(IndexablePointEntityLineHitTester.b, IndexablePointEntityLineHitTester.bp);
        const ab = IndexablePointEntityLineHitTester.b.subtract(IndexablePointEntityLineHitTester.a, IndexablePointEntityLineHitTester.ab);

        const distanceFromLine = IndexablePointEntityLineHitTester.getPerpendicularDistanceToLineSegment(ab, bp, ap);

        const sizeOffset = entity.data.offsets.size;
        let cssLineWidthAtJoin: number;

        if (sizeOffset != null)
        {
            const sizeTransform = entity.graphicsSettings.pointSizeNormalizer.getSizeToPixelTransform();
            const sizeStart = sizeTransform.getVec2MultiplyX(entity.data.getValue(indexOfFirstPoint, sizeOffset));
            const sizeEnd = sizeTransform.getVec2MultiplyX(entity.data.getValue(indexOfFirstPoint + 1, sizeOffset));
            const segmentLength = ab.getMagnitude();
            const sizeScalingFactor = (sizeEnd - sizeStart) / segmentLength;
            const apLength = ap.getMagnitude();
            // the length of the segment ab up to the intersection of the line perpendicular to ab that passes through a
            const intersectionLength = Math.sqrt(apLength * apLength - distanceFromLine * distanceFromLine);

            cssLineWidthAtJoin = (sizeStart + sizeScalingFactor * intersectionLength) * 0.5;
        }
        else
        {
            cssLineWidthAtJoin = entity.graphicsSettings.pointDisplay.getPixelSize() * 0.5;
        }

        return distanceFromLine * updateArg.canvasDimensions.dpr <= cssLineWidthAtJoin;
    }

    private static getPerpendicularDistanceToLineSegment(ab: Vec2<TTypedArray>, bp: Vec2<TTypedArray>, ap: Vec2<TTypedArray>): number
    {
        if (ab.dotProduct(bp) > 0)
        {
            // outside of line segment
            return Infinity;
        }

        if (ab.dotProduct(ap) < 0)
        {
            // outside of line segment
            return Infinity;
        }
        else
        {
            // is perpendicular to line segment
            const x1 = ab.getX();
            const y1 = ab.getY();
            return Math.abs(x1 * ap.getY() - y1 * ap.getX()) / Math.sqrt(x1 * x1 + y1 * y1);
        }
    }

    // start point of line
    private static a = Vec2.f64.factory.createOneEmpty();
    // end point of line
    private static b = Vec2.f64.factory.createOneEmpty();
    // line vector
    private static ab = Vec2.f64.factory.createOneEmpty();
    // line start to pointer
    private static ap = Vec2.f64.factory.createOneEmpty();
    // line end to pointer
    private static bp = Vec2.f64.factory.createOneEmpty();
}