import { IBaseEntityRenderer } from "../i-base-entity-renderer";
import { IRendererSharedState } from "../i-renderer-shared-state";

/**
 * @public
 * Canvas renderer entity draw hooks.
 */
export interface ICanvasEntityRenderer extends IBaseEntityRenderer<{}, CanvasRenderingContext2D>
{
}

/**
 * @public
 * {@inheritDoc ICanvasEntityRenderer}
 */
export class CanvasEntityRenderer implements ICanvasEntityRenderer
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
}