/**
 * @public
 * Takes a DOM node and inserts a {@link IChartComponent} into it.
 */
export interface IGraphAttachPointProvider
{
    getCanvasElement(): HTMLCanvasElement;
    getWrapperElement(): HTMLElement;
    getHiddenElement(): HTMLDivElement;
}

/**
 * @public
 * {@inheritDoc IGraphAttachPointProvider}
 */
export class GraphAttachPointProvider implements IGraphAttachPointProvider
{
    constructor
    (
        private readonly attachPointElement: HTMLElement,
        template: string = chartMarkup,
    )
    {
        // FIXME this won't work with most CSPs
        attachPointElement.innerHTML = template;
    }

    public getCanvasElement(): HTMLCanvasElement
    {
        return this.attachPointElement.getElementsByClassName("ecs-canvas")[0] as HTMLCanvasElement;
    }

    public getWrapperElement(): HTMLElement
    {
        return this.attachPointElement.getElementsByClassName("ecs-chart")[0] as HTMLElement;
    }

    public getHiddenElement(): HTMLDivElement
    {
        return this.attachPointElement.getElementsByClassName("ecs-hidden-element")[0] as HTMLDivElement;
    }
}

const chartMarkup = `
<div class="ecs-chart">
    <canvas class="ecs-canvas"></canvas>
    <div class="ecs-hidden-element"></div>
</div>
`;