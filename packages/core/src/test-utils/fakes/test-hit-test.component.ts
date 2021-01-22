import { IHitTestComponent } from "../../eventing/user-interaction/hit-test/i-hit-test-component";
import { IHitTestableTrait } from "../../entities/groups/i-hit-testable-trait";

/**
 * @internal
 */
export class TestHitTestComponent implements IHitTestComponent<unknown, IHitTestableTrait, unknown>
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