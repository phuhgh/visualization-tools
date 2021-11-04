import { IRenderer, IRendererCallbacks } from "../i-renderer";
import { CanvasComponentRenderer, ICanvasComponentRenderer } from "./canvas-component-renderer";
import { IComponentRendererProvider } from "../component-renderer/i-component-renderer-provider";
import { IComponentRendererFactory } from "../component-renderer/i-component-renderer-factory";
import { _Dictionary } from "rc-js-util";
import { CanvasComponentRendererProvider } from "./canvas-component-renderer-provider";
import { CanvasRendererFactory } from "./canvas-renderer-factory";
import { ICanvasDimensions } from "../../templating/canvas-dimensions";
import { IReadonlyPlot } from "../../plot/i-plot";
import { CanvasRendererSharedState } from "./canvas-renderer-shared-state";
import { ITransformComponentStore, TransformComponentStore } from "../transform-components/transform-component-store";
import { GraphicsComponentStore } from "../graphics-component-store";

/**
 * @public
 * Canvas implementation of {@link IRenderer}.
 */
export interface ICanvasRenderer extends IRenderer<ICanvasComponentRenderer>
{
    readonly transformComponents: ITransformComponentStore<ICanvasComponentRenderer>;
}

/**
 * @public
 * {@inheritDoc ICanvasRenderer}
 */
export class CanvasRenderer implements ICanvasRenderer
{
    public static createOne
    (
        context: CanvasRenderingContext2D | null,
        callbacks?: Partial<IRendererCallbacks<CanvasRenderingContext2D>>,
    )
        : ICanvasRenderer | null
    {
        if (context == null)
        {
            return null;
        }

        return new CanvasRenderer(context, callbacks);
    }

    public context: CanvasRenderingContext2D;
    public componentRendererProvider: IComponentRendererProvider<ICanvasComponentRenderer>;
    public componentRendererFactory: IComponentRendererFactory<{}, ICanvasComponentRenderer>;
    public readonly graphicsComponents = new GraphicsComponentStore<ICanvasComponentRenderer>();
    public readonly transformComponents: ITransformComponentStore<ICanvasComponentRenderer>;
    public readonly sharedState: CanvasRendererSharedState;

    public onBeforePlotDraw(plot: IReadonlyPlot<unknown, unknown>, canvasDims: ICanvasDimensions): void
    {
        this.sharedState.onNewFrame();
        this.callbacks.onBeforePlotDraw(this.context, plot.plotDimensionsOTL, canvasDims);
    }

    public onAfterPlotDraw(): void
    {
        this.callbacks.onAfterPlotDraw(this.context);
    }

    public onContextLost(): void
    {
        // no action required
    }

    public onContextRegained(context: CanvasRenderingContext2D): void
    {
        const { componentRendererFactory, componentRendererProvider } = this.getFactories(context);
        this.sharedState.setContext(context);
        this.componentRendererProvider = componentRendererProvider;
        this.componentRendererFactory = componentRendererFactory;
    }

    protected constructor
    (
        context: CanvasRenderingContext2D,
        callbacks: Partial<IRendererCallbacks<CanvasRenderingContext2D>> | undefined,
    )
    {
        if (callbacks != null)
        {
            _Dictionary.extend(this.callbacks, callbacks);
        }

        this.context = context;
        this.sharedState = new CanvasRendererSharedState(context);
        const { componentRendererFactory, componentRendererProvider } = this.getFactories(context);
        this.componentRendererProvider = componentRendererProvider;
        this.componentRendererFactory = componentRendererFactory;
        this.transformComponents = new TransformComponentStore();
    }

    private getFactories(context: CanvasRenderingContext2D)
    {
        const componentRenderer = new CanvasComponentRenderer(context, this.sharedState);

        return {
            componentRendererProvider: new CanvasComponentRendererProvider(componentRenderer),
            componentRendererFactory: new CanvasRendererFactory(componentRenderer),
        };
    }

    private callbacks: IRendererCallbacks<CanvasRenderingContext2D> = {
        onBeforePlotDraw(context, plotDimensions)
        {
            const plotRange = plotDimensions.pixelArea.wholeRange;

            context.clearRect(
                plotRange.getXMin() | 0,
                plotRange.getYMin() | 0,
                plotRange.getXRange() | 0,
                plotRange.getYRange() | 0,
            );
        },
        onAfterPlotDraw()
        {
            // no action needed
        },
    };

    public TComponentRenderer!: ICanvasComponentRenderer;
}
