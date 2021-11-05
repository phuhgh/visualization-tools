import { TGlExtensionKeys } from "../rendering/gl/i-gl-extensions";
import { GraphAttachPoint, IGraphAttachPoint } from "../templating/graph-attach-point";
import { IRenderer } from "../rendering/i-renderer";
import { TGlComponentRenderer } from "../rendering/gl/component-renderer/gl-component-renderer";
import { TF32Vec2, Vec2 } from "rc-js-util";
import { GraphAttachPointProvider } from "../templating/graph-attach-point-provider";
import { EventService } from "../eventing/event-service";
import { ChartConfig } from "../chart/chart-config";
import { Gl2ContextAdapter } from "../rendering/gl/context/gl2-context-adapter";
import { GlRenderer } from "../rendering/gl/gl-renderer";
import { GlRendererOptions } from "../rendering/gl/gl-renderer-options";
import { TGlFeatureFlags } from "../rendering/gl/t-gl-feature-flags";

/**
 * @internal
 **/
export class TestGl2RendererHarness<TExts extends TGlExtensionKeys = never>
{
    public attachPoint: IGraphAttachPoint;
    public renderer: IRenderer<TGlComponentRenderer<WebGL2RenderingContext, TExts>>;

    public constructor
    (
        exts: TExts[],
        dims: TF32Vec2 = Vec2.f32.factory.createOne(20, 20),
        featureFlags: TGlFeatureFlags[] = [],
    )
    {
        this.div = document.createElement("div");
        const config = new ChartConfig();
        this.attachPoint = new GraphAttachPoint(new GraphAttachPointProvider(this.div), new EventService(), config);
        const options = new GlRendererOptions(exts, { preserveDrawingBuffer: true, antialias: false }, featureFlags);
        const contextAdapter = new Gl2ContextAdapter(this.attachPoint.canvasElement, options.onCreate.contextAttributes);
        const renderer = GlRenderer.createOne(contextAdapter.getContext(), options);

        if (renderer == null)
        {
            throw new Error("failed to create renderer");
        }

        this.renderer = renderer;
        const context = contextAdapter.getContext();

        if (context == null)
        {
            throw new Error("failed to get context");
        }
        this.context = context;

        this.context.viewport(0, 0, dims.getX(), dims.getY());
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

    public reset(): void
    {
        this.context.clearColor(0, 0, 0, 0);
        this.context.clear(this.context.STENCIL_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT | this.context.COLOR_BUFFER_BIT);
    }

    /**
     * Coord from bottom left, starting at 0,0.
     */
    public readPixels(x: number, y: number, width: number = 1, height: number = 1): Uint8Array
    {
        const color = new Uint8Array(4 * width * height);
        this.context.readPixels(x, y, width, height, this.context.RGBA, this.context.UNSIGNED_BYTE, color);

        return color;
    }

    private readonly div: HTMLDivElement;
    private readonly context: WebGL2RenderingContext;
}

