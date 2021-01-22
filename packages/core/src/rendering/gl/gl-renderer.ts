import { TGlContext } from "./t-gl-context";
import { IRenderer, IRendererCallbacks } from "../i-renderer";
import { _Array, _Dictionary, TF32Vec4 } from "rc-js-util";
import { IEntityRendererProvider } from "../i-entity-renderer-provider";
import { IEntityRendererFactory } from "../i-entity-renderer-factory";
import { TGlEntityRenderer } from "./entity-renderer/gl-entity-renderer";
import { TGlExtensionKeys } from "./i-gl-extensions";
import { GlEntityRendererProvider } from "./entity-renderer/gl-entity-renderer-provider";
import { GlRendererFactory } from "./gl-renderer-factory";
import { ICanvasDimensions } from "../../templating/canvas-dimensions";
import { IErrorLocalization } from "../../errors/i-error-localization";
import { developerErrorLocalization } from "../../errors/developer-error-localization";
import { IGlProgramSpec } from "./gl-program-specification";
import { IGlRendererOptions } from "./gl-renderer-options";
import { IGraphicsComponentSpecification } from "../i-graphics-component-specification";
import { CompositeGraphicsComponent } from "../../entities/components/composite-graphics-component";
import { emptyGlProgramSpecification } from "./shaders/empty-gl-program-specification";
import { IReadonlyPlot } from "../../plot/i-plot";
import { GlRendererSharedState, IGlRendererSharedState } from "./gl-renderer-shared-state";
import { TExtractGcSpec } from "../t-extract-gc-spec";
import { TExtractGcContext } from "../t-extract-gc-context";

/**
 * @public
 * WebGl system hooks and config (clearing bits, {@link TGlFeatureFlags} etc). Most WebGl state is handled at the
 * {@link TGlEntityRenderer} level.
 */
export interface IGlRenderer<TCtx extends TGlContext, TExts extends TGlExtensionKeys>
    extends IRenderer<TGlEntityRenderer<TCtx, TExts>>
{
    readonly sharedState: IGlRendererSharedState;
}

/**
 * @public
 * {@inheritDoc IGlRenderer}
 */
export class GlRenderer<TCtx extends TGlContext, TExts extends TGlExtensionKeys>
    implements IGlRenderer<TCtx, TExts>
{
    public static createOne<TCtx extends TGlContext, TExts extends TGlExtensionKeys>
    (
        context: TCtx | null,
        options: IGlRendererOptions<TExts>,
        localizations: IErrorLocalization<unknown> = developerErrorLocalization as IErrorLocalization<unknown>,
        callbacks?: Partial<IRendererCallbacks<TCtx>>,
    )
        : IRenderer<TGlEntityRenderer<TCtx, TExts>> | null
    {
        if (context == null)
        {
            return null;
        }

        const sharedState = new GlRendererSharedState(context);
        const factory = GlRendererFactory.createOne(context, options.onCreate.requiredExtensionsToGet, localizations, sharedState);

        if (factory == null)
        {
            return null;
        }

        return new GlRenderer<TCtx, TExts>(context as TCtx, options, factory, callbacks, sharedState);
    }

    public context: TExtractGcContext<TGlEntityRenderer<TCtx, TExts>>;
    public readonly entityRendererProvider: IEntityRendererProvider<TGlEntityRenderer<TCtx, TExts>>;
    public readonly entityRendererFactory: IEntityRendererFactory<IGlProgramSpec, TGlEntityRenderer<TCtx, TExts>>;
    public readonly graphicsComponents = new Map<string, IGraphicsComponentSpecification<TGlEntityRenderer<TCtx, TExts>, unknown, unknown>>();
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

    public createCompositeGraphicsComponent<TUpdateArg, TTraits>
    (
        graphicsComp: IGraphicsComponentSpecification<TGlEntityRenderer<TCtx, TExts>, TUpdateArg, TTraits>,
    )
        : CompositeGraphicsComponent<TGlEntityRenderer<TCtx, TExts>, TUpdateArg, TTraits>
    {
        const spec = emptyGlProgramSpecification as TExtractGcSpec<TGlEntityRenderer<TCtx, TExts>>;
        return new CompositeGraphicsComponent(spec, graphicsComp);
    }

    public onContextRegained(context: TExtractGcContext<TGlEntityRenderer<TCtx, TExts>>): void
    {
        this.context = context as TExtractGcContext<TGlEntityRenderer<TCtx, TExts>>;
        this.sharedState.setContext(context);
        (this.entityRendererFactory as GlRendererFactory<TCtx, TExts>).setContext(context);
        this.entityRendererProvider.reinitializeRenderers(this.entityRendererFactory);
    }

    protected constructor
    (
        context: TCtx,
        options: IGlRendererOptions<TExts>,
        renderContextFactory: GlRendererFactory<TCtx, TExts>,
        callbacks: Partial<IRendererCallbacks<TCtx>> | undefined,
        sharedState: IGlRendererSharedState,
    )
    {
        if (callbacks != null)
        {
            _Dictionary.extend(this.callbacks, callbacks);
        }

        this.sharedState = sharedState;
        this.context = context as TExtractGcContext<TGlEntityRenderer<TCtx, TExts>>;
        this.entityRendererProvider = new GlEntityRendererProvider();
        this.entityRendererFactory = renderContextFactory;

        _Array.forEach(options.onCreate.featuresToEnable, feature => this.context.enable(this.context[feature]));
        this.clearBit = options.onNewFrame.bufferBitsToClear.reduce((clearBit, flagName) => clearBit | this.context[flagName], 0);
        this.clearColor = options.onNewFrame.clearWithColor;
    }

    private readonly clearBit: number;
    private readonly clearColor: TF32Vec4;
    private readonly callbacks: IRendererCallbacks<TCtx> = {
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
}