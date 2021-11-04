import { IChartComponent } from "../chart/chart-component";
import { ChartConfig } from "../chart/chart-config";
import { CanvasChartFactory } from "../chart/canvas-chart-factory";
import { ICanvasRenderer } from "../rendering/canvas/canvas-renderer";

/**
 * @internal
 */
export class TestCanvasChartHarness
{
    public readonly chart: IChartComponent<ICanvasRenderer>;

    public constructor
    ()
    {
        this.div = document.createElement("div");
        const config = new ChartConfig();
        const chartComp = CanvasChartFactory.createOne(this.div, config);

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