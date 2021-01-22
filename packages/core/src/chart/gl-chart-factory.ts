import { TGlExtensionKeys } from "../rendering/gl/i-gl-extensions";
import { ChartComponent, IChartComponent } from "./chart-component";
import { IGlRendererOptions } from "../rendering/gl/gl-renderer-options";
import { EventService } from "../eventing/chart-event-service";
import { GraphAttachPoint } from "../templating/graph-attach-point";
import { GraphAttachPointProvider } from "../templating/graph-attach-point-provider";
import { ChartConfig, IChartConfig } from "./chart-config";
import { GlRenderer } from "../rendering/gl/gl-renderer";
import { TGlEntityRenderer } from "../rendering/gl/entity-renderer/gl-entity-renderer";
import { TGlContext } from "../rendering/gl/t-gl-context";
import { TGlContextAdapterCtor } from "../rendering/gl/t-gl-context-adapter-ctor";

/**
 * @public
 * WebGL {@link IChartComponent}.
 */
export type TGlChart<TExts extends TGlExtensionKeys, TCtx extends TGlContext> =
    IChartComponent<TGlEntityRenderer<TCtx, TExts>>
    ;

/**
 * @public
 * Factory to make {@link TGlChart}.
 */
export class GlChartFactory
{
    public static createOne<TExts extends TGlExtensionKeys
        , TCtx extends TGlContext
        , TAdapterCtor extends TGlContextAdapterCtor<TCtx>>
    (
        chartContainer: HTMLElement,
        contextAdapterCtor: TAdapterCtor,
        chartConfig: IChartConfig,
        rendererOptions: IGlRendererOptions<TExts>,
    )
        : TGlChart<TExts, TCtx> | null
    {
        const eventService = new EventService();
        const attachPoint = new GraphAttachPoint(new GraphAttachPointProvider(chartContainer), eventService, chartConfig);
        const contextAdapter = new contextAdapterCtor(attachPoint.canvasElement, rendererOptions.onCreate.contextAttributes);
        const config = new ChartConfig();
        const renderer = GlRenderer.createOne(contextAdapter.getContext(), rendererOptions);

        if (renderer == null)
        {
            return null;
        }

        return new ChartComponent(attachPoint, renderer, eventService, config, contextAdapter);
    }
}