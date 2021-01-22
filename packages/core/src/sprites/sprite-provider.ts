import { IGraphAttachPoint } from "../templating/graph-attach-point";

/**
 * @public
 * Creates a hidden 2d canvas, useful for sprites etc.
 */
export class SpriteProvider
{
    public constructor
    (
        attachPoint: IGraphAttachPoint,
    )
    {
        this.canvasElement = attachPoint.addHiddenElement("axis-labels", "canvas");
        this.context = this.initializeContext();
    }

    public upscaleCanvas(width: number, height: number): void
    {
        if (height > this.canvasElement.height)
        {
            height = SpriteProvider.nearestPowerOf2(height);
            this.canvasElement.height = height;
        }

        if (width > this.canvasElement.width)
        {
            width = SpriteProvider.nearestPowerOf2(width);
            this.canvasElement.width = width;
        }
    }

    public getCanvas(): HTMLCanvasElement
    {
        return this.canvasElement;
    }

    public getContext(): CanvasRenderingContext2D
    {
        return this.context;
    }

    private initializeContext(): CanvasRenderingContext2D
    {
        const context = this.canvasElement.getContext("2d");

        if (context == null)
        {
            throw new Error("failed to initialize axis canvas");
        }

        return context;
    }

    private static nearestPowerOf2(value: number): number
    {
        return 1 << (32 - Math.clz32(value));
    }

    private readonly canvasElement: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;
}
