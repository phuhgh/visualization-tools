import { IHitTestableTrait } from "../../entities/groups/i-hit-testable-trait";
import { IHitTestComponent } from "./i-hit-test-component";

/**
 * @public
 * A hit test component that will never hit.
 */
export class NoOpHitTestComponent implements IHitTestComponent<unknown, IHitTestableTrait, unknown>
{
    public hitTest(): boolean
    {
        return false;
    }

    public index(): void
    {
        // no action required
    }
}
