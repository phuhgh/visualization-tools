import { IRenderer, IRendererCallbacks } from "../i-renderer";
import { CanvasEntityRenderer, ICanvasEntityRenderer } from "./canvas-entity-renderer";
import { IEntityRendererProvider } from "../i-entity-renderer-provider";
import { IEntityRendererFactory } from "../i-entity-renderer-factory";
import { _Dictionary } from "rc-js-util";
import { CanvasEntityRendererProvider } from "./canvas-entity-renderer-provider";
import { CanvasRendererFactory } from "./canvas-renderer-factory";
import { ICanvasDimensions } from "../../templating/canvas-dimensions";
import { IGraphicsComponentSpecification } from "../i-graphics-component-specification";
import { CompositeGraphicsComponent } from "../../entities/components/composite-graphics-component";
import { IReadonlyPlot } from "../../plot/i-plot";
import { CanvasRendererSharedState } from "./canvas-renderer-shared-state";
import { TExtractGcSpec } from "../t-extract-gc-spec";

/**
 * @public
 * Canvas implementation of {@link IRenderer}.
 */
export interface ICanvasRenderer extends IRenderer<ICanvasEntityRenderer>
{
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
        : IRenderer<ICanvasEntityRenderer> | null
    {
        if (context == null)
        {
            return null;
        }

        return new CanvasRenderer(context, callbacks);
    }

    public context: CanvasRenderingContext2D;
    public entityRendererProvider: IEntityRendererProvider<ICanvasEntityRenderer>;
    public entityRendererFactory: IEntityRendererFactory<{}, ICanvasEntityRenderer>;
    public readonly graphicsComponents = new Map<string, IGraphicsComponentSpecification<ICanvasEntityRenderer, unknown, unknown>>();
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

    public onContextRegained(context: CanvasRenderingContext2D): void
    {
        const { entityRendererFactory, entityRendererProvider } = this.getFactories(context);
        this.sharedState.setContext(context);
        this.entityRendererProvider = entityRendererProvider;
        this.entityRendererFactory = entityRendererFactory;
    }

    public createCompositeGraphicsComponent<TUpdateArg, TTraits>
    (
        graphicsComp: IGraphicsComponentSpecification<ICanvasEntityRenderer, TUpdateArg, TTraits>,
    )
        : CompositeGraphicsComponent<ICanvasEntityRenderer, TUpdateArg, TTraits>
    {
        return new CompositeGraphicsComponent({} as TExtractGcSpec<ICanvasEntityRenderer>, graphicsComp);
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
        const { entityRendererFactory, entityRendererProvider } = this.getFactories(context);
        this.entityRendererProvider = entityRendererProvider;
        this.entityRendererFactory = entityRendererFactory;
    }

    private getFactories(context: CanvasRenderingContext2D)
    {
        const entityRenderer = new CanvasEntityRenderer(context, this.sharedState);

        return {
            entityRendererProvider: new CanvasEntityRendererProvider(entityRenderer),
            entityRendererFactory: new CanvasRendererFactory(entityRenderer),
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
}
