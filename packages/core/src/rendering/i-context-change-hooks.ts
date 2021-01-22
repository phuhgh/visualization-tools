/**
 * @public
 * Context adapter event hooks.
 */
export interface IContextChangeHooks
{
    onContextLost(): void;
    onContextRestored(): void;

    registerCallbacks(contextLost: () => void, contextRestored: () => void): void;
}