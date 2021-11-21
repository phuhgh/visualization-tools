export function onAppScriptsLoaded(): HTMLDivElement
{
    const loadingElement = document.getElementById("app-loading");

    if (loadingElement != null)
    {
        loadingElement.remove();
    }

    const rootElement = document.createElement("div");
    rootElement.classList.add("component");
    rootElement.classList.add("overflow-y-hidden");
    document.body.appendChild(rootElement);

    return rootElement;
}