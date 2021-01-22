import { IReadonlyVec2, TF32Vec2, Vec2 } from "rc-js-util";
import { CanvasDimensions, ICanvasDimensions } from "../../../templating/canvas-dimensions";

/**
 * @public
 * Wrapper of `MouseEvent` with position translated into chart coordinate systems.
 */
export interface IChartPointerEvent<TEvent extends MouseEvent>
{
    readonly canvasDims: ICanvasDimensions;
    /**
     * NB this has an origin in the BOTTOM left corner (native is top left).
     */
    readonly pointerCssPosition: IReadonlyVec2<Float32Array>;
    readonly pointerClipPosition: IReadonlyVec2<Float32Array>;
    readonly $event: TEvent;

    clone(): IChartPointerEvent<TEvent>;
}

/**
 * @public
 * {@inheritDoc IChartPointerEvent}
 */
export class ChartPointerEvent<TEvent extends MouseEvent> implements IChartPointerEvent<TEvent>
{
    public static createOneEmpty(): ChartPointerEvent<PointerEvent>
    {
        return new ChartPointerEvent
        (
            CanvasDimensions.createDefault(),
            Vec2.f32.factory.createOneEmpty(),
            Vec2.f32.factory.createOneEmpty(),
            new PointerEvent("dummy"),
        );
    }

    public constructor
    (
        public canvasDims: ICanvasDimensions,
        public pointerCssPosition: TF32Vec2,
        public pointerClipPosition: TF32Vec2,
        public $event: TEvent,
    )
    {
    }

    public clone(): IChartPointerEvent<TEvent>
    {
        return new ChartPointerEvent(
            this.canvasDims.clone(),
            this.pointerCssPosition.slice(),
            this.pointerClipPosition.slice(),
            this.$event,
        );
    }
}