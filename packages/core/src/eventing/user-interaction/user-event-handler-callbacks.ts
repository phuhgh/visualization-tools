import { _Dictionary } from "rc-js-util";
import { IInteractionStateChangeCallbacks } from "./i-interaction-state-change-callbacks";

/**
 * @public
 * Hooks for user interaction events.
 */
export class UserEventHandlerCallbacks<TTraits>
    implements IInteractionStateChangeCallbacks<TTraits>
{
    public onEntityRequiresUpdate(): void
    {
        // no action required
    }

    public onDragStart(): boolean
    {
        return true;
    }

    public onDrag(): void
    {
        // no action required
    }

    public onDragEnd(): void
    {
        // no action required
    }

    public onPan(): void
    {
        // no action required
    }

    public onWheel(): void
    {
        // no action required
    }

    public onPanZoomStart(): void
    {
        // no action required
    }

    public onPanZoomChange(): void
    {
        // no action required
    }

    public onClick(): void
    {
        // no action required
    }

    public onDoubleClick(): void
    {
        // no action required
    }

    public onHover(): void
    {
        // no action required
    }

    public onCanvasResized(): void
    {
        // no action required
    }

    public constructor
    (
        listeners: Partial<IInteractionStateChangeCallbacks<TTraits>>,
    )
    {
        _Dictionary.extend(this, listeners);
    }
}