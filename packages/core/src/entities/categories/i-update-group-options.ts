import { IGraphicsComponent } from "../../rendering/i-graphics-component";
import { TUnknownEntityRenderer } from "../../rendering/t-unknown-entity-renderer";

/**
 * @public
 */
export interface IUpdateGroupOptions<TUpdateArg>
{
    graphicsComponent: IGraphicsComponent<TUnknownEntityRenderer, TUpdateArg, unknown>;
}