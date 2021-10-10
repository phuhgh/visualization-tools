import { IComponentRendererFactory } from "../component-renderer/i-component-renderer-factory";
import { ICanvasComponentRenderer } from "./canvas-component-renderer";

/**
 * @public
 * Canvas {@link IComponentRendererFactory}.
 */
export class CanvasRendererFactory implements IComponentRendererFactory<object, ICanvasComponentRenderer>
{
    public constructor
    (
        private componentRenderer: ICanvasComponentRenderer,
    )
    {
    }

    public createRenderer(): ICanvasComponentRenderer
    {
        return this.componentRenderer;
    }
}
