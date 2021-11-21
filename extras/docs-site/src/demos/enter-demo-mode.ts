export function enterDemoMode(rootElement: HTMLDivElement): void
{
    if (!rootElement.classList.contains("hide-overflow"))
    {
        rootElement.classList.add("hide-overflow");
    }
}