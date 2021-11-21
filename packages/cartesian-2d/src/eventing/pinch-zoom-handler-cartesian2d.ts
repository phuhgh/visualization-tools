import { IReadonlyVec2, Mat3, Range2d, TF32Vec2, TTypedArray, Vec2 } from "rc-js-util";
import { ICartesian2dPlotRange } from "../update/update-arg/cartesian2d-plot-range";
import { ICanvasDimensions, IReadonlyPlot } from "@visualization-tools/core";
import { CartesianUserInteractionTransformProvider } from "./cartesian-user-interaction-transform-provider";

/**
 * @public
 * User interaction handler for pinch zooming.
 */
export class PinchZoomHandlerCartesian2d<TArray extends TTypedArray>
{
    public constructor
    (
        private readonly plot: IReadonlyPlot<ICartesian2dPlotRange<TArray>, unknown>,
        private readonly canvasDims: ICanvasDimensions,
        centerPointCssCanvas: IReadonlyVec2<Float32Array>,
        private prevWidth: number,
    )
    {
        this.dataRangeTmp = this.plot.plotRange.dataRange.slice();
        this.previousCenterPoint = centerPointCssCanvas.slice();
        this.userTransformProvider = new CartesianUserInteractionTransformProvider(plot);
    }

    public onPanZoomChange
    (
        cssCenterPoint: IReadonlyVec2<Float32Array>,
        distanceBetweenPoints: number,
    )
        : void
    {
        const dataRange = this.plot.plotRange.dataRange;
        const previousCenterPoint = this.previousCenterPoint;
        const dd = this.userTransformProvider.getTransformedDelta(
            cssCenterPoint,
            this.plot.plotDimensionsOBL.pixelArea.interactiveRange,
            previousCenterPoint.getX() - cssCenterPoint.getX(),
            previousCenterPoint.getY() - cssCenterPoint.getY(),
        );

        previousCenterPoint.set(cssCenterPoint);

        this.dataRangeTmp.set(dataRange);
        this.plot.plotDimensionsOBL.cssArea.interactiveRange.getRangeTransform(this.dataRangeTmp, this.canvasToDataTransform);
        cssCenterPoint.mat3Multiply(this.canvasToDataTransform, this.scaleAbout);
        this.scaleAbout.bound2d(this.dataRangeTmp);

        this.dataRangeTmp.scaleRelativeTo(this.prevWidth / distanceBetweenPoints, this.scaleAbout, this.dataRangeTmp);
        this.dataRangeTmp.translateBy(-dd[0] * this.canvasDims.dpr, -dd[1] * this.canvasDims.dpr);

        this.plot.plotRange.updateDataRange(this.dataRangeTmp);
        this.prevWidth = distanceBetweenPoints;
    }

    private readonly scaleAbout: Vec2<Float32Array> = new Vec2.f32();
    private readonly canvasToDataTransform = Mat3.f32.factory.createOneEmpty();
    private readonly previousCenterPoint: TF32Vec2;
    private readonly dataRangeTmp: Range2d<TArray>;
    private readonly userTransformProvider: CartesianUserInteractionTransformProvider<TTypedArray>;
}