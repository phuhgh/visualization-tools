import { IComponentRendererProvider } from "../component-renderer/i-component-renderer-provider";
import { ICanvasComponentRenderer } from "./canvas-component-renderer";

/**
 * @public
 * Canvas implementation of {@link IComponentRendererProvider}.
 */
export class CanvasComponentRendererProvider implements IComponentRendererProvider<ICanvasComponentRenderer>
{
    public constructor
    (
        private context: ICanvasComponentRenderer,
    )
    {
    }

    public getRenderer(): ICanvasComponentRenderer
    {
        return this.context;
    }

    public initializeRenderer(): ICanvasComponentRenderer
    {
        return this.context;
    }

    public onContextLost(): void
    {
        // no action is required
    }

    public reinitializeRenderers(): void
    {
        // no action is required
    }
}