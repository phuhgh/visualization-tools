import { IHitAllowedComponent } from "./i-hit-allowed-component";

/**
 * @public
 * A {@link IHitAllowedComponent} that always returns true.
 */
export class HitAlwaysAllowedComponent implements IHitAllowedComponent<unknown, unknown>
{
    public isHitAllowed(): boolean
    {
        return true;
    }
}