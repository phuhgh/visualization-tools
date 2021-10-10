import { IRendererSharedState } from "../i-renderer-shared-state";

/**
 * @public
 * Renderer invariant entity renderer. See extensions for specific implementations.
 */
export interface IBaseComponentRenderer<TGCSpec, TCtx>
{
    readonly context: TCtx;
    readonly specification: TGCSpec;
    readonly sharedState: IRendererSharedState;

    onContextLost(): void;

    onBeforeInitialization(): void;
    onAfterInitialization(): void;

    onBeforeDraw(): void;
    onAfterDraw(): void;
}

