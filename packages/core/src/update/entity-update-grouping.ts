import { IGraphicsComponent } from "../rendering/i-graphics-component";
import { TUnknownEntityRenderer } from "../rendering/t-unknown-entity-renderer";

/**
 * @public
 * A grouping of a graphics component with its renderer.
 */
export class EntityUpdateGrouping<TUpdateArg, TRequiredTraits>
{
    public constructor
    (
        public readonly graphicsComponent: IGraphicsComponent<TUnknownEntityRenderer, TUpdateArg, TRequiredTraits>,
        public readonly entityRenderer: TUnknownEntityRenderer,
    )
    {
    }
}