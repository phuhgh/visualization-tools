import { IEntityRendererFactory } from "../i-entity-renderer-factory";
import { ICanvasEntityRenderer } from "./canvas-entity-renderer";

/**
 * @public
 * Canvas {@link IEntityRendererFactory}.
 */
export class CanvasRendererFactory implements IEntityRendererFactory<object, ICanvasEntityRenderer>
{
    public constructor
    (
        private entityRenderer: ICanvasEntityRenderer,
    )
    {
    }

    public createRenderer(): ICanvasEntityRenderer
    {
        return this.entityRenderer;
    }
}
