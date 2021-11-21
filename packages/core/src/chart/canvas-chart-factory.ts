import { GraphAttachPoint } from "../templating/graph-attach-point";
import { GraphAttachPointProvider } from "../templating/graph-attach-point-provider";
import { CanvasRenderer, ICanvasRenderer } from "../rendering/canvas/canvas-renderer";
import { EventService } from "../eventing/event-service";
import { ChartComponent, IChartComponent } from "./chart-component";
import { CanvasContextAdapter } from "../rendering/canvas/canvas-context-adapter";
import { IChartOptions } from "./i-chart-options";

/**
 * @public
 * Canvas chart.
 */
export type TCanvasChart = IChartComponent<ICanvasRenderer>;

/**
 * @public
 * Options for {@link CanvasChartFactory}
 */
export interface ICanvasChartOptions extends IChartOptions
{
    // reserved for future use
}

/**
 * @public
 * Creates canvas charts.
 */
export class CanvasChartFactory
{
    public static createOne(options: ICanvasChartOptions): TCanvasChart | null
    {
        const eventService = new EventService();
        const attachPoint = new GraphAttachPoint(
            new GraphAttachPointProvider(options.chartContainer),
            eventService,
            options.chartConfig,
        );
        const contextAdapter = new CanvasContextAdapter(attachPoint.canvasElement);
        const renderer = CanvasRenderer.createOne(contextAdapter.getContext());

        if (renderer == null)
        {
            return null;
        }

        return new ChartComponent(attachPoint, renderer, eventService, options.chartConfig, contextAdapter);
    }
}