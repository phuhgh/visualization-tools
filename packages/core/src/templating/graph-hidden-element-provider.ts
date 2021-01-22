import { IGraphAttachPoint } from "./graph-attach-point";

export interface IGraphHiddenElementProvider
{
    addElement(element: HTMLElement, name: string): void;
    removeElement(name: string): void;
}

export class GraphHiddenElementProvider implements IGraphHiddenElementProvider
{
    constructor
    (
        private readonly attachPoint: IGraphAttachPoint,
    )
    {
    }

    public addElement<TElement extends HTMLElement>(element: TElement, name: string): void
    {
        if (this.elements.has(name))
        {
            return;
        }

        element.classList.add(name);
        this.attachPoint.hiddenElement.appendChild(element);
    }

    public removeElement(name: string): void
    {
        const element = this.attachPoint.hiddenElement.querySelector(name);

        if (element != null)
        {
            this.attachPoint.hiddenElement.removeChild(element);
        }

        this.elements.delete(name);
    }

    private readonly elements: Map<string, boolean> = new Map();
}