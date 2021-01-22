import { ChartPointerEvent } from "./chart-pointer-event";
import { CanvasDimensions, ICanvasDimensions } from "../../../templating/canvas-dimensions";
import { IGraphAttachPoint } from "../../../templating/graph-attach-point";

export interface IPointerEventProvider
{
    updatePointerEvent<TEvent extends MouseEvent>($event: TEvent, writeTo: ChartPointerEvent<TEvent>): void;
    setCanvasDims(canvasDims: ICanvasDimensions): void;
}

export class PointerEventProvider implements IPointerEventProvider
{
    public constructor
    (
        private readonly attachPoint: IGraphAttachPoint,
    )
    {
    }

    public updatePointerEvent<TEvent extends MouseEvent>($event: TEvent, writeTo: ChartPointerEvent<TEvent>): void
    {
        writeTo.$event = $event;
        const offsetX = $event.clientX - this.attachPoint.canvasDims.boundingRect.getXMin();
        const offsetY = $event.clientY - this.attachPoint.canvasDims.boundingRect.getYMin();
        // make y grow up instead of down
        writeTo.pointerCssPosition.update(offsetX, this.canvasDimensions.cssDims.getYRange() - offsetY);
        writeTo.pointerCssPosition.mat3Multiply(this.canvasDimensions.transforms.cssToClip, writeTo.pointerClipPosition);
        writeTo.canvasDims = this.canvasDimensions;
    }

    public setCanvasDims(canvasDims: ICanvasDimensions): void
    {
        this.canvasDimensions = canvasDims;
    }

    private canvasDimensions = CanvasDimensions.createDefault();
}