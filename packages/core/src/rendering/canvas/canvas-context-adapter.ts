import { IContextAdapter } from "../i-context-adapter";

/**
 * @public
 * Canvas implementation of {@link IContextAdapter}.
 */
export class CanvasContextAdapter implements IContextAdapter<CanvasRenderingContext2D>
{
    public constructor
    (
        private readonly canvasElement: HTMLCanvasElement,
    )
    {
    }

    public onResize(): void
    {
        // no action needed
    }

    public getContext(): CanvasRenderingContext2D | null
    {
        if (this.context != null)
        {
            return this.context;
        }

        return this.context = this.canvasElement.getContext("2d");
    }

    private context: CanvasRenderingContext2D | null = null;
}
