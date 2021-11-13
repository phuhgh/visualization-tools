import { TGlContext } from "./t-gl-context";
import { IRenderer, IRendererCallbacks } from "../i-renderer";
import { _Array, _Dictionary, TF32Vec4, TTypedArray } from "rc-js-util";
import { IComponentRendererProvider } from "../component-renderer/i-component-renderer-provider";
import { IComponentRendererFactory } from "../component-renderer/i-component-renderer-factory";
import { TGlComponentRenderer } from "./component-renderer/gl-component-renderer";
import { TGlExtensionKeys } from "./i-gl-extensions";
import { GlComponentRendererProvider } from "./component-renderer/gl-component-renderer-provider";
import { GlComponentRendererFactory } from "./gl-component-renderer-factory";
import { ICanvasDimensions } from "../../templating/canvas-dimensions";
import { IErrorLocalization } from "../../errors/i-error-localization";
import { developerErrorLocalization } from "../../errors/developer-error-localization";
import { IGlProgramSpec } from "./gl-program-specification";
import { IGlRendererOptions } from "./gl-renderer-options";
import { IReadonlyPlot } from "../../plot/i-plot";
import { GlRendererSharedState, IGlRendererSharedState } from "./gl-renderer-shared-state";
import { TExtractGcContext } from "../component-renderer/t-extract-gc-context";
import { TGl2ComponentRenderer } from "./component-renderer/t-gl2-component-renderer";
import { ITransformComponentStore, TransformComponentStore } from "../transform-components/transform-component-store";
import { GraphicsComponentStore } from "../graphics-component-store";
import { IGlBuffer } from "./buffers/i-gl-buffer";
import { emitContextLossOnEntityGlBuffers } from "./buffers/emit-context-loss-on-entity-gl-buffers";
import { reinitializeBufferLayouts } from "./buffers/reinitialize-buffer-layouts";

/**
 * @public
 * WebGl system hooks and config (clearing bits, {@link TGlFeatureFlags} etc). Most WebGl state is handled at the
 * {@link TGlComponentRenderer} level.
 */
export interface IGlRenderer<TComponentRenderer extends TGlComponentRenderer<TGlContext, never>>
    extends IRenderer<TComponentRenderer>
{
    readonly transformComponents: ITransformComponentStore<TGl2ComponentRenderer>;
    readonly sharedState: IGlRendererSharedState;

    initializeBuffers(buffers: readonly IGlBuffer<TTypedArray>[]): void;
    destroyBuffers(buffers: readonly IGlBuffer<TTypedArray>[]): void;
}

/**
 * @public
 * {@inheritDoc IGlRenderer}
 */
export class GlRenderer<TComponentRenderer extends TGlComponentRenderer<TGlContext, never>>
    implements IGlRenderer<TComponentRenderer>
{
    public static createOne<TCtx extends TGlContext, TExts extends TGlExtensionKeys>
    (
        context: TCtx | null,
        options: IGlRendererOptions<TExts>,
        localizations: IErrorLocalization<unknown> = developerErrorLocalization as IErrorLocalization<unknown>,
        callbacks?: Partial<IRendererCallbacks<TCtx>>,
    )
        : IGlRenderer<TGlComponentRenderer<TCtx, TExts>> | null
    {
        if (context == null)
        {
            return null;
        }

        const sharedState = new GlRendererSharedState(context);
        const factory = GlComponentRendererFactory.createOne(context, options.onCreate.requiredExtensionsToGet, localizations, sharedState);

        if (factory == null)
        {
            return null;
        }

        return new GlRenderer(context, options, factory, callbacks, sharedState);
    }

    public context: TExtractGcContext<TComponentRenderer>;
    public readonly componentRendererProvider: IComponentRendererProvider<TComponentRenderer>;
    public readonly componentRendererFactory: IComponentRendererFactory<IGlProgramSpec, TComponentRenderer>;
    public readonly graphicsComponents = new GraphicsComponentStore<TComponentRenderer>();
    public readonly transformComponents: ITransformComponentStore<TGl2ComponentRenderer>;
    public readonly sharedState: IGlRendererSharedState;

    public onBeforePlotDraw(plot: IReadonlyPlot<unknown, unknown>, canvasDims: ICanvasDimensions): void
    {
        this.sharedState.onNewFrame();
        this.callbacks.onBeforePlotDraw(this.context, plot.plotDimensionsOBL, canvasDims);
    }

    public onAfterPlotDraw(): void
    {
        this.callbacks.onAfterPlotDraw(this.context);
    }

    public onContextLost(): void
    {
        this.componentRendererProvider.onContextLost();
        this.sharedState.onContextLost();
        emitContextLossOnEntityGlBuffers(this.sharedState.entityBuffers);
    }

    public onContextRegained(context: TExtractGcContext<TComponentRenderer>): void
    {
        this.context = context as TExtractGcContext<TComponentRenderer>;
        this.sharedState.setContext(context);
        (this.componentRendererFactory as GlComponentRendererFactory<TComponentRenderer>).setContext(context);
        this.componentRendererProvider.reinitializeRenderers(this.componentRendererFactory);
        this.graphicsComponents.reinitializeGraphicsComponents(this);
        reinitializeBufferLayouts(this.context, this.sharedState.entityBuffers);
    }

    public initializeBuffers(buffers: readonly IGlBuffer<TTypedArray>[]): void
    {
        for (let i = 0, iEnd = buffers.length; i < iEnd; ++i)
        {
            buffers[i].initialize(this.context);
        }
    }

    public destroyBuffers(buffers: readonly IGlBuffer<TTypedArray>[]): void
    {
        for (let i = 0, iEnd = buffers.length; i < iEnd; ++i)
        {
            buffers[i].destroy(this.context);
        }
    }

    protected constructor
    (
        context: TGlContext,
        options: IGlRendererOptions<TGlExtensionKeys>,
        renderContextFactory: GlComponentRendererFactory<TComponentRenderer>,
        callbacks: Partial<IRendererCallbacks<TExtractGcContext<TComponentRenderer>>> | undefined,
        sharedState: IGlRendererSharedState,
    )
    {
        if (callbacks != null)
        {
            _Dictionary.extend(this.callbacks, callbacks);
        }

        this.sharedState = sharedState;
        this.context = context as TExtractGcContext<TComponentRenderer>;
        this.componentRendererProvider = new GlComponentRendererProvider<TComponentRenderer>();
        this.componentRendererFactory = renderContextFactory as IComponentRendererFactory<IGlProgramSpec, TComponentRenderer>;
        this.transformComponents = new TransformComponentStore();

        _Array.forEach(options.onCreate.featuresToEnable, feature => this.context.enable(this.context[feature]));
        this.clearBit = options.onNewFrame.bufferBitsToClear.reduce((clearBit, flagName) => clearBit | this.context[flagName], 0);
        this.clearColor = options.onNewFrame.clearWithColor;
    }

    private readonly clearBit: number;
    private readonly clearColor: TF32Vec4;
    private readonly callbacks: IRendererCallbacks<TGlContext> = {
        onBeforePlotDraw: (context, plotDimensions) =>
        {
            this.sharedState.updateScissorRange(plotDimensions.pixelArea.wholeRange);
            context.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], this.clearColor[3]);
            context.clear(this.clearBit);
        },
        onAfterPlotDraw()
        {
            // no action needed
        },
    };

    public TComponentRenderer!: TComponentRenderer;
}
