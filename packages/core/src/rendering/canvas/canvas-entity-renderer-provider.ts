import { IEntityRendererProvider } from "../i-entity-renderer-provider";
import { ICanvasEntityRenderer } from "./canvas-entity-renderer";

/**
 * @public
 * Canvas implementation of {@link IEntityRendererProvider}.
 */
export class CanvasEntityRendererProvider implements IEntityRendererProvider<ICanvasEntityRenderer>
{
    public constructor
    (
        private context: ICanvasEntityRenderer,
    )
    {
    }

    public getRenderer(): ICanvasEntityRenderer
    {
        return this.context;
    }

    public initializeRenderer(): ICanvasEntityRenderer
    {
        return this.context;
    }

    public reinitializeRenderers(): void
    {
        // no action is required
    }
}