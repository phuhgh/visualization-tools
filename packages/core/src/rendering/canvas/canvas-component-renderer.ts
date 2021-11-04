import { IBaseComponentRenderer } from "../component-renderer/i-base-component-renderer";
import { IRendererSharedState } from "../i-renderer-shared-state";

/**
 * @public
 * Canvas renderer entity draw hooks.
 */
export interface ICanvasComponentRenderer extends IBaseComponentRenderer<{}, CanvasRenderingContext2D>
{
}

/**
 * @public
 * {@inheritDoc ICanvasComponentRenderer}
 */
export class CanvasComponentRenderer implements ICanvasComponentRenderer
{
    public specification = {};

    public constructor
    (
        public readonly context: CanvasRenderingContext2D,
        public readonly sharedState: IRendererSharedState,
    )
    {
    }

    public onAfterInitialization(): void
    {
        // no action needed
    }

    public onBeforeInitialization(): void
    {
        // no action needed
    }

    public onAfterDraw(): void
    {
        // no action needed
    }

    public onBeforeDraw(): void
    {
        // no action needed
    }

    public onContextLost(): void
    {
        // no action needed
    }
}