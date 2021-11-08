import { IChartComponentOptions } from "./i-chart-component-options";
import { IGlChartOptions, IGlRenderer, TGl2ComponentRenderer, TGlExtensionKeys } from "@visualization-tools/core";

export interface IGlChartComponentOptions<TExts extends TGlExtensionKeys = never>
    extends IChartComponentOptions<IGlChartOptions<WebGL2RenderingContext, TExts>, IGlRenderer<TGl2ComponentRenderer<TExts>>>
{
}