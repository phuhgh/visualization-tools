import { IContextChangeHooks } from "./i-context-change-hooks";

export class ContextChangeHooks implements IContextChangeHooks
{
    public registerCallbacks
    (
        contextLost: () => void,
        contextRestored: () => void,
    )
        : void
    {
        this.contextLost = contextLost;
        this.contextRestored = contextRestored;
    }

    public onContextLost(): void
    {
        if (this.contextLost != null)
        {
            this.contextLost();
        }
    }

    public onContextRestored(): void
    {
        if (this.contextRestored != null)
        {
            this.contextRestored();
        }
    }

    private contextLost: (() => void) | undefined;
    private contextRestored: (() => void) | undefined;
}