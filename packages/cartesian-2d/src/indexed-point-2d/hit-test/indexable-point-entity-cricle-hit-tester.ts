import { IReadonlyVec2, TTypedArray } from "rc-js-util";
import { ICartesian2dUpdateArg } from "../../update/cartesian2d-update-arg";
import { THitTestableIndexedPoint2dTrait } from "../../traits/t-hit-testable-indexed-point-2d-trait";
import { TEntityTrait } from "@visualization-tools/core";

/**
 * @internal
 * Hit tests a ${@link TIndexedPointTrait} drawn as a circle.
 */
export class IndexablePointEntityCircleHitTester
{
    /**
     * @returns true if the cssPosition is within the circle.
     */
    public static hitTestEntity<TArray extends TTypedArray>
    (
        entity: TEntityTrait<ICartesian2dUpdateArg<TArray>, THitTestableIndexedPoint2dTrait<TArray>>,
        indexOfPoint: number,
        cssPosition: IReadonlyVec2<Float32Array>,
        updateArg: ICartesian2dUpdateArg<TArray>,
    )
        : boolean
    {
        const xOffset = entity.data.offsets.x;
        const yOffset = entity.data.offsets.y;

        const dataTransform = updateArg.interactionTransforms.dataToInteractiveArea;
        const dx = cssPosition.getX() - dataTransform.getVec3MultiplyX(entity.data.getValue(indexOfPoint, xOffset));
        const dy = cssPosition.getY() - dataTransform.getVec3MultiplyY(entity.data.getValue(indexOfPoint, yOffset));

        const distanceFromCenterSq = dx * dx + dy * dy;

        const sizeOffset = entity.data.offsets.size;
        let cssRadiusOfCircleSq: number;

        if (sizeOffset != null)
        {
            const sizeTransform = entity.graphicsSettings.pointSizeNormalizer.getSizeToPixelTransform();
            const cssSize = sizeTransform.getVec2MultiplyX(entity.data.getValue(indexOfPoint, sizeOffset));

            cssRadiusOfCircleSq = cssSize * cssSize * 0.5;
        }
        else
        {
            const hs = entity.graphicsSettings.pointDisplay.getPixelSize() * 0.5;
            cssRadiusOfCircleSq = hs * hs;
        }

        // compare the squares, no need to take sqrt
        return distanceFromCenterSq * updateArg.canvasDimensions.dpr <= cssRadiusOfCircleSq;
    }
}