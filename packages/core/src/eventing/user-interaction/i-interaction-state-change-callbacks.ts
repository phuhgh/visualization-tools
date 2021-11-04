import { IChartPointerEvent } from "./internal-events/chart-pointer-event";
import { IReadonlyVec2 } from "rc-js-util";
import { TOnCanvasResized } from "../../templating/events/on-canvas-resized";
import { HitTestResult } from "../hit-testing/hit-test-result";
import { EEntityUpdateFlag } from "../../update/e-entity-update-flag";
import { IOnHoverResult } from "./on-hover-result";

/**
 * @public
 */
export interface IInteractionStateChangeCallbacks<TTraits>
    extends TOnCanvasResized
{
    onEntityRequiresUpdate(updateFlag: EEntityUpdateFlag): void;

    /**
     * Return `true` to indicate that dragging is allowed systemically. To indicate that an entity should be dragged,
     * have the entity's onDragStart return true too.
     */
    onDragStart(targets: readonly HitTestResult<unknown, TTraits>[], $event: IChartPointerEvent<PointerEvent>): boolean;
    onDragEnd($event: IChartPointerEvent<PointerEvent>): void;
    onDrag($event: IChartPointerEvent<PointerEvent>): void;

    onPan($event: IChartPointerEvent<PointerEvent>, dx: number, dy: number): void;
    onWheel($event: IChartPointerEvent<MouseEvent>, dz: number): void;
    onPanZoomStart(centerPointCssCanvas: IReadonlyVec2<Float32Array>, width: number): void;
    onPanZoomChange
    (
        $event: IChartPointerEvent<PointerEvent>,
        cssCenterPoint: IReadonlyVec2<Float32Array>,
        distanceBetweenPoints: number,
    )
        : void;

    onClick(targets: readonly HitTestResult<unknown, TTraits>[], $event: IChartPointerEvent<PointerEvent>): void;
    onDoubleClick(targets: readonly HitTestResult<unknown, TTraits>[], $event: IChartPointerEvent<PointerEvent>): void;
    onHover(hoverResult: IOnHoverResult<TTraits>, $event: IChartPointerEvent<PointerEvent>): void;
}
