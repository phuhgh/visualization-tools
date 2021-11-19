import { ICartesian2dPlotRange } from "../update/update-arg/cartesian2d-plot-range";
import { IReadonlyVec2, Range2d, TTypedArray, Vec2 } from "rc-js-util";
import { PinchZoomHandlerCartesian2d } from "./pinch-zoom-handler-cartesian2d";
import { EEntityUpdateFlag, HitTestResult, IChartComponent, IChartPointerEvent, IInteractionStateChangeCallbacks, IOnHoverResult, IPlot, OnPlotRequiresUpdate, TUnknownRenderer, UserEventHandlerCallbacks } from "@visualization-tools/core";
import { CartesianUserInteractionTransformProvider } from "./cartesian-user-interaction-transform-provider";

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
        private readonly chart: IChartComponent<TUnknownRenderer>,
        private readonly plot: IPlot<ICartesian2dPlotRange<TTypedArray>, unknown>,
        listeners: Partial<IInteractionStateChangeCallbacks<TTraits>>,
    )
    {
        this.userCallbacks = new UserEventHandlerCallbacks(listeners);
        this.tmpRange2d = plot.plotRange.dataRange
            .slice()
            .fill(0);
        this.userTransformProvider = new CartesianUserInteractionTransformProvider(plot);
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
        hoverResult: IOnHoverResult<TTraits>,
        $event: IChartPointerEvent<PointerEvent>,
    )
        : void
    {
        this.userCallbacks.onHover(hoverResult, $event);
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
        const dd = this.userTransformProvider.getTransformedDelta(
            $event.pointerCssPosition,
            this.plot.plotDimensionsOBL.pixelArea.interactiveRange,
            dx,
            dy,
        );

        this.tmpRange2d.set(plotRange.dataRange);
        this.tmpRange2d.translateBy(dd.getX(), dd.getY());
        plotRange.updateDataRange(this.tmpRange2d);

        this.userCallbacks.onPan($event, dx, dy);
        this.chart.updateOnNextFrame(this.plot);
    }

    public onPanZoomStart(cssCenterPoint: IReadonlyVec2<Float32Array>, width: number): void
    {
        this.pinchZoomHandler = new PinchZoomHandlerCartesian2d(
            this.plot,
            this.chart.attachPoint.canvasDims,
            cssCenterPoint.slice(),
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
        // ut - user transform
        const plotRange = this.plot.plotRange;
        const utDataPosition = this.userTransformProvider.getTransformedPosition(
            $event.pointerClipPosition,
            this.plot.plotDimensionsOBL.clipSpaceArea.interactiveRange,
        );

        this.tmpRange2d.set(plotRange.transformedDataRange);
        this.tmpRange2d.scaleRelativeTo(1 - dz * 0.001, utDataPosition, this.tmpRange2d);
        plotRange.userTransform.reverseTransformRange(this.tmpRange2d, this.tmpRange2d);
        this.tmpRange2d.bound(plotRange.maxBounds);

        plotRange.updateDataRange(this.tmpRange2d);

        this.userCallbacks.onWheel($event, dz);
        this.chart.updateOnNextFrame(this.plot);
    }

    private userCallbacks: IInteractionStateChangeCallbacks<TTraits>;
    private pinchZoomHandler = new PinchZoomHandlerCartesian2d(
        this.plot,
        this.chart.attachPoint.canvasDims,
        Vec2.f32.factory.createOneEmpty(),
        0,
    );
    private readonly tmpRange2d: Range2d<TTypedArray>;
    private readonly userTransformProvider: CartesianUserInteractionTransformProvider<TTypedArray>;
}
