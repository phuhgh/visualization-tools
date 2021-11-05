import { IChartComponent } from "../chart/chart-component";
import { ChartConfig } from "../chart/chart-config";
import { TGl2ComponentRenderer } from "../rendering/gl/component-renderer/t-gl2-component-renderer";
import { GlChartFactory } from "../chart/gl-chart-factory";
import { IGlRenderer } from "../rendering/gl/gl-renderer";
import { Gl2ContextAdapter } from "../rendering/gl/context/gl2-context-adapter";
import { TGlExtensionKeys } from "../rendering/gl/i-gl-extensions";
import { IGlRendererOptions } from "../rendering/gl/gl-renderer-options";
import { TGlFeatureFlags } from "../rendering/gl/t-gl-feature-flags";
import { Vec4 } from "rc-js-util";

/**
 * @internal
 */
export class TestGlChartHarness<TExts extends TGlExtensionKeys = never>
{
    public readonly chart: IChartComponent<IGlRenderer<TGl2ComponentRenderer>>;

    public constructor
    (
        extensions: TExts[] = [],
        featuresToEnable: TGlFeatureFlags[] = ["SCISSOR_TEST", "DEPTH_TEST", "CULL_FACE"],
        contextAttributes: WebGLContextAttributes = {
            antialias: false,
            preserveDrawingBuffer: true,
        },
    )
    {
        this.div = document.createElement("div");
        const config = new ChartConfig();
        const rendererConfig: IGlRendererOptions<TExts> = {
            onCreate: {
                requiredExtensionsToGet: extensions,
                featuresToEnable: featuresToEnable,
                contextAttributes,
            },
            onNewFrame: {
                bufferBitsToClear: ["COLOR_BUFFER_BIT", "COLOR_BUFFER_BIT", "STENCIL_BUFFER_BIT"],
                clearWithColor: new Vec4.f32(),
            },
        };
        const chartComp = GlChartFactory.createOne(this.div, Gl2ContextAdapter, config, rendererConfig);

        if (chartComp == null)
        {
            throw new Error("failed to created chart component");
        }

        this.chart = chartComp;
    }

    public attachToBody(): void
    {
        this.chart.attachPoint.canvasElement.style.border = "1px solid black";
        this.chart.attachPoint.canvasElement.style.width = "400px";
        this.chart.attachPoint.canvasElement.style.height = "400px";
        this.chart.attachPoint.canvasElement.style.imageRendering = "pixelated";
        document.body.appendChild(this.chart.attachPoint.canvasElement);
    }

    public removeFromBody(): void
    {
        this.chart.attachPoint.canvasElement.remove();
    }

    private readonly div: HTMLDivElement;
}