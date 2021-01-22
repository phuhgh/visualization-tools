import { ICartesian2dPlotRange } from "../update/cartesian2d-plot-range";
import { IReadonlyVec2, Mat3, Range2d, TTypedArray, Vec2 } from "rc-js-util";
import { PinchZoomHandlerCartesian2d } from "./pinch-zoom-handler-cartesian2d";
import { EEntityUpdateFlag, HitTestResult, IChartComponent, IChartPointerEvent, IInteractionStateChangeCallbacks, IPlot, OnPlotRequiresUpdate, TUnknownEntityRenderer, UserEventHandlerCallbacks } from "@visualization-tools/core";

/**
 * @public
 * Default interaction handler for cartesian 2d. Allows panning, zooming with mouse and touch events like pinch zoom.
 * Ranges are restricted to avoid float precision issues, see {@link Cartesian2dFloatPrecisionRangeBounder}.
 */
export class Cartesian2dInteractionHandler<TTraits>
    implements IInteractionStateChangeCallbacks<TTraits>
{
    public constructor
    (
        private readonly chart: IChartComponent<TUnknownEntityRenderer>,
        private readonly plot: IPlot<ICartesian2dPlotRange<TTypedArray>, unknown>,
        listeners: Partial<IInteractionStateChangeCallbacks<TTraits>>,
    )
    {
        this.userCallbacks = new UserEventHandlerCallbacks(listeners);
        this.tmpRange = plot.plotRange.dataRange.slice();
    }

    public onEntityRequiresUpdate(updateFlag: EEntityUpdateFlag): void
    {
        OnPlotRequiresUpdate.emit(this.plot, updateFlag);
    }

    public onCanvasResized(): void
    {
        // no action needed
    }

    public onClick
    (
        targets: readonly HitTestResult<unknown, TTraits>[],
        $event: IChartPointerEvent<PointerEvent>,
    )
        : void
    {
        this.userCallbacks.onClick(targets, $event);
    }

    public onDoubleClick
    (
        targets: readonly HitTestResult<unknown, TTraits>[],
        $event: IChartPointerEvent<PointerEvent>,
    )
        : void
    {
        this.userCallbacks.onDoubleClick(targets, $event);
    }

    public onHover
    (
        newlyHovered: readonly HitTestResult<unknown, TTraits>[],
        stillHovered: readonly HitTestResult<unknown, TTraits>[],
        noLongerHovered: readonly HitTestResult<unknown, TTraits>[],
        $event: IChartPointerEvent<PointerEvent>,
    )
        : void
    {
        this.userCallbacks.onHover(newlyHovered, stillHovered, noLongerHovered, $event);
    }

    public onDragStart
    (
        targets: readonly HitTestResult<unknown, TTraits>[],
        $event: IChartPointerEvent<PointerEvent>,
    )
        : boolean
    {
        return this.userCallbacks.onDragStart(targets, $event);
    }

    public onDragEnd($event: IChartPointerEvent<PointerEvent>): void
    {
        this.userCallbacks.onDragEnd($event);
    }

    public onDrag($event: IChartPointerEvent<PointerEvent>): void
    {
        this.userCallbacks.onDrag($event);
    }

    public onPan($event: IChartPointerEvent<PointerEvent>, dx: number, dy: number): void
    {
        const plotRange = this.plot.plotRange;
        const interactiveRange = this.plot.plotDimensionsOBL.pixelArea.interactiveRange;
        const ddx = -plotRange.dataRange.getXRange() * dx / interactiveRange.getXRange();
        const ddy = -plotRange.dataRange.getYRange() * dy / interactiveRange.getYRange();

        this.tmpRange.set(plotRange.dataRange);
        this.tmpRange.translateBy(ddx, ddy);
        plotRange.updateDataRange(this.tmpRange, this.chart.attachPoint.canvasDims);

        this.userCallbacks.onPan($event, dx, dy);
        this.chart.updateOnNextFrame(this.plot);
    }

    public onPanZoomStart(centerPointCssCanvas: IReadonlyVec2<Float32Array>, width: number): void
    {
        this.pinchZoomHandler = new PinchZoomHandlerCartesian2d(
            this.plot,
            this.chart.attachPoint.canvasDims,
            centerPointCssCanvas.slice(),
            width,
        );
    }

    public onPanZoomChange
    (
        $event: IChartPointerEvent<PointerEvent>,
        centerPoint: IReadonlyVec2<Float32Array>,
        distanceBetweenPoints: number,
    )
        : void
    {
        this.pinchZoomHandler.onPanZoomChange(centerPoint, distanceBetweenPoints);
        this.userCallbacks.onPanZoomChange($event, centerPoint, distanceBetweenPoints);
        this.chart.updateOnNextFrame(this.plot);
    }

    public onWheel($event: IChartPointerEvent<MouseEvent>, dz: number): void
    {
        const plotRange = this.plot.plotRange;
        const interactiveRange = this.plot.plotDimensionsOBL.clipSpaceArea.interactiveRange;
        interactiveRange.getRangeTransform(plotRange.dataRange, this.interactiveClipToData);
        const dataPosition = $event.pointerClipPosition.mat3Multiply(this.interactiveClipToData);

        this.tmpRange.set(plotRange.dataRange);
        this.tmpRange.scaleRelativeTo(1 - dz * 0.001, dataPosition, this.tmpRange);
        plotRange.updateDataRange(this.tmpRange, this.chart.attachPoint.canvasDims);

        this.userCallbacks.onWheel($event, dz);
        this.chart.updateOnNextFrame(this.plot);
    }

    private userCallbacks: IInteractionStateChangeCallbacks<TTraits>;
    private readonly interactiveClipToData = Mat3.f32.factory.createOneEmpty();
    private pinchZoomHandler = new PinchZoomHandlerCartesian2d(
        this.plot,
        this.chart.attachPoint.canvasDims,
        Vec2.f32.factory.createOneEmpty(),
        0,
    );
    private readonly tmpRange: Range2d<TTypedArray>;
}