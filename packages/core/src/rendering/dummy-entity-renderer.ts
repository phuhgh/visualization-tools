import { IRendererSharedState } from "./i-renderer-shared-state";
import { IBaseEntityRenderer } from "./i-base-entity-renderer";

export class DummyEntityRenderer implements IBaseEntityRenderer<unknown, unknown>
{
    public readonly context: unknown;
    public readonly specification: unknown;

    public constructor
    (
        public readonly sharedState: IRendererSharedState,
    )
    {
    }

    public onAfterDraw(): void
    {
        // no action
    }

    public onAfterInitialization(): void
    {
        // no action
    }

    public onBeforeDraw(): void
    {
        // no action
    }

    public onBeforeInitialization(): void
    {
        // no action
    }
}