import { TUnknownComponentRenderer } from "../t-unknown-component-renderer";
import { TGraphicsComponent } from "./t-graphics-component";
import { _Debug } from "rc-js-util";

/**
 * @public
 * Children components of a {@link ICompositeGraphicsComponent}.
 */
export interface IGraphicsSubComponents<TComponentRenderer extends TUnknownComponentRenderer, TUpdateArg, TEntityTraits>
{
    getSubComponents(): readonly TGraphicsComponent<TComponentRenderer, TUpdateArg, TEntityTraits>[];
    addComponent(graphicsComp: TGraphicsComponent<TComponentRenderer, TUpdateArg, TEntityTraits>): void;
    setSubComponent(graphicsComp: TGraphicsComponent<TComponentRenderer, TUpdateArg, TEntityTraits>, index: number): void;
}

/**
 * @public
 * {@inheritDoc IGraphicsSubComponents}
 */
export class GraphicsSubComponents<TComponentRenderer extends TUnknownComponentRenderer, TUpdateArg, TEntityTraits>
    implements IGraphicsSubComponents<TComponentRenderer, TUpdateArg, TEntityTraits>
{
    public constructor
    (
        private readonly graphicsComponents: TGraphicsComponent<TComponentRenderer, TUpdateArg, TEntityTraits>[],
    )
    {
    }

    public addComponent(graphicsComp: TGraphicsComponent<TComponentRenderer, TUpdateArg, TEntityTraits>): void
    {
        this.graphicsComponents.push(graphicsComp);
    }

    public getSubComponents(): readonly TGraphicsComponent<TComponentRenderer, TUpdateArg, TEntityTraits>[]
    {
        return this.graphicsComponents;
    }

    public setSubComponent(graphicsComp: TGraphicsComponent<TComponentRenderer, TUpdateArg, TEntityTraits>, index: number): void
    {
        DEBUG_MODE && _Debug.assert(this.graphicsComponents.length > index, "index OOB");

        this.graphicsComponents[index] = graphicsComp;
    }
}
