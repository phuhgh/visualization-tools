import { TGlExtensionKeys } from "../rendering/gl/i-gl-extensions";
import { ChartComponent, IChartComponent } from "./chart-component";
import { IGlRendererOptions } from "../rendering/gl/gl-renderer-options";
import { EventService } from "../eventing/event-service";
import { GraphAttachPoint } from "../templating/graph-attach-point";
import { GraphAttachPointProvider } from "../templating/graph-attach-point-provider";
import { ChartConfig, IChartConfig } from "./chart-config";
import { GlRenderer, IGlRenderer } from "../rendering/gl/gl-renderer";
import { TGlContext } from "../rendering/gl/t-gl-context";
import { TGlContextAdapterCtor } from "../rendering/gl/t-gl-context-adapter-ctor";
import { TGlComponentRenderer } from "../rendering/gl/component-renderer/gl-component-renderer";

/**
 * @public
 * WebGL {@link IChartComponent}.
 */
export type TGlChart<TComponentRenderer extends TGlComponentRenderer<TGlContext, never>> =
    IChartComponent<IGlRenderer<TComponentRenderer>>
    ;

/**
 * @public
 * Factory to make {@link TGlChart}.
 */
export class GlChartFactory
{
    public static createOne<TExts extends TGlExtensionKeys, TCtx extends TGlContext>
    (
        chartContainer: HTMLElement,
        contextAdapterCtor: TGlContextAdapterCtor<TCtx>,
        chartConfig: IChartConfig,
        rendererOptions: IGlRendererOptions<TExts>,
    )
        : TGlChart<TGlComponentRenderer<TCtx, TExts>> | null
    {
        const eventService = new EventService();
        const attachPoint = new GraphAttachPoint(new GraphAttachPointProvider(chartContainer), eventService, chartConfig);
        const contextAdapter = new contextAdapterCtor(
            attachPoint.canvasElement,
            eventService,
            rendererOptions.onCreate.contextAttributes,
        );
        const config = new ChartConfig();
        const renderer = GlRenderer.createOne(contextAdapter.getContext(), rendererOptions);

        if (renderer == null)
        {
            return null;
        }

        return new ChartComponent(attachPoint, renderer, eventService, config, contextAdapter);
    }
}