import { ICanvasEntityRenderer } from "../rendering/canvas/canvas-entity-renderer";
import { GraphAttachPoint } from "../templating/graph-attach-point";
import { GraphAttachPointProvider } from "../templating/graph-attach-point-provider";
import { IChartConfig } from "./chart-config";
import { CanvasRenderer } from "../rendering/canvas/canvas-renderer";
import { EventService } from "../eventing/chart-event-service";
import { ChartComponent, IChartComponent } from "./chart-component";
import { CanvasContextAdapter } from "../rendering/canvas/canvas-context-adapter";

/**
 * @public
 * Canvas chart.
 */
export type TCanvasChart = IChartComponent<ICanvasEntityRenderer>;

/**
 * @public
 * Creates canvas charts.
 */
export class CanvasChartFactory
{
    public static createOne
    (
        chartContainer: HTMLElement,
        config: IChartConfig,
    )
        : TCanvasChart | null
    {
        const eventService = new EventService();
        const attachPoint = new GraphAttachPoint(new GraphAttachPointProvider(chartContainer), eventService, config);
        const contextAdapter = new CanvasContextAdapter(attachPoint.canvasElement);
        const renderer = CanvasRenderer.createOne(contextAdapter.getContext());

        if (renderer == null)
        {
            return null;
        }

        return new ChartComponent(attachPoint, renderer, eventService, config, contextAdapter);
    }
}