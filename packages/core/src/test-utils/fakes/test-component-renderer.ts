import { IBaseComponentRenderer } from "../../rendering/component-renderer/i-base-component-renderer";
import { IRendererSharedState } from "../../rendering/i-renderer-shared-state";
import { TestRendererSharedState } from "./test-renderer-shared-state";

/**
 * @internal
 */
export class TestComponentRenderer implements IBaseComponentRenderer<object, unknown>
{
    public readonly context: unknown;
    public readonly sharedState: IRendererSharedState = new TestRendererSharedState();
    public readonly specification: object = {};

    public onAfterDraw(): void
    {
        // override as required
    }

    public onAfterInitialization(): void
    {
        // override as required
    }

    public onBeforeDraw(): void
    {
        // override as required
    }

    public onBeforeInitialization(): void
    {
        // override as required
    }

    public onContextLost(): void
    {
        // override as required
    }
}

