import { TUnknownComponentRenderer } from "./t-unknown-component-renderer";
import { IGraphicsComponentSpecification } from "./graphics-components/i-graphics-component-specification";
import { initializeGraphicsComponent } from "./graphics-components/initialize-graphics-component";
import { IRenderer } from "./i-renderer";

/**
 * @public
 * Stores both graphics components and transform components.
 */
export interface IGraphicsComponentStore<TComponentRenderer extends TUnknownComponentRenderer>
{
    getComponent(componentId: string): IGraphicsComponentSpecification<TComponentRenderer> | undefined;
    setComponent(component: IGraphicsComponentSpecification<TComponentRenderer>): void;
    reinitializeGraphicsComponents(renderer: IRenderer<TComponentRenderer>): void;
}

/**
 * @public
 * {@inheritDoc IGraphicsComponentStore}
 */
export class GraphicsComponentStore<TComponentRenderer extends TUnknownComponentRenderer>
    implements IGraphicsComponentStore<TComponentRenderer>
{
    public getComponent(componentId: string): IGraphicsComponentSpecification<TComponentRenderer> | undefined
    {
        return this.graphicsComponents.get(componentId);
    }

    public setComponent(component: IGraphicsComponentSpecification<TComponentRenderer>): void
    {
        this.graphicsComponents.set(component.getCacheId(), component);
    }

    public reinitializeGraphicsComponents(renderer: IRenderer<TComponentRenderer>): void
    {
        this.graphicsComponents.forEach((gc) =>
        {
            initializeGraphicsComponent(renderer, gc);

        });
    }

    private readonly graphicsComponents = new Map<string, IGraphicsComponentSpecification<TComponentRenderer>>();
}