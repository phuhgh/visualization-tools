import { IChartPointerEvent } from "./internal-events/chart-pointer-event";
import { IReadonlyVec2 } from "rc-js-util";
import { TOnCanvasResized } from "../events/on-canvas-resized";
import { HitTestResult } from "./hit-test/hit-test-result";
import { EEntityUpdateFlag } from "../../update/e-entity-update-flag";

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
        centerPoint: IReadonlyVec2<Float32Array>,
        distanceBetweenPoints: number,
    )
        : void;

    onClick(targets: readonly HitTestResult<unknown, TTraits>[], $event: IChartPointerEvent<PointerEvent>): void;
    onDoubleClick(targets: readonly HitTestResult<unknown, TTraits>[], $event: IChartPointerEvent<PointerEvent>): void;
    onHover
    (
        newlyHovered: readonly HitTestResult<unknown, TTraits>[],
        stillHovered: readonly HitTestResult<unknown, TTraits>[],
        noLongerHovered: readonly HitTestResult<unknown, TTraits>[],
        $event: IChartPointerEvent<PointerEvent>,
    )
        : void;
}
