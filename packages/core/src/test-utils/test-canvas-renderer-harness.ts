import { GraphAttachPoint, IGraphAttachPoint } from "../templating/graph-attach-point";
import { IRenderer } from "../rendering/i-renderer";
import { ICanvasEntityRenderer } from "../rendering/canvas/canvas-entity-renderer";
import { TF32Vec2 } from "rc-js-util";
import { GraphAttachPointProvider } from "../templating/graph-attach-point-provider";
import { EventService } from "../eventing/chart-event-service";
import { ChartConfig } from "../chart/chart-config";
import { CanvasContextAdapter } from "../rendering/canvas/canvas-context-adapter";
import { CanvasRenderer } from "../rendering/canvas/canvas-renderer";

/**
 * @internal
 **/
export class TestCanvasRendererHarness
{
    public attachPoint: IGraphAttachPoint;
    public renderer: IRenderer<ICanvasEntityRenderer>;

    public constructor
    (
        dims: TF32Vec2,
    )
    {
        this.div = document.createElement("div");
        const config = new ChartConfig();
        this.attachPoint = new GraphAttachPoint(new GraphAttachPointProvider(this.div), new EventService(), config);
        const contextAdapter = new CanvasContextAdapter(this.attachPoint.canvasElement);
        const context = contextAdapter.getContext();

        if (context == null)
        {
            throw new Error("failed to get context");
        }
        this.context = context;

        const renderer = CanvasRenderer.createOne(this.context);

        if (renderer == null)
        {
            throw new Error("failed to create renderer");
        }

        this.renderer = renderer;
        this.attachPoint.canvasElement.width = dims.getX();
        this.attachPoint.canvasElement.height = dims.getY();
    }

    public attachToBody(): void
    {
        this.attachPoint.canvasElement.style.border = "1px solid black";
        this.attachPoint.canvasElement.style.width = "400px";
        this.attachPoint.canvasElement.style.height = "400px";
        this.attachPoint.canvasElement.style.imageRendering = "pixelated";
        document.body.appendChild(this.attachPoint.canvasElement);
    }

    public removeFromBody(): void
    {
        this.attachPoint.canvasElement.remove();
    }

    private readonly div: HTMLDivElement;
    private readonly context: CanvasRenderingContext2D;
}