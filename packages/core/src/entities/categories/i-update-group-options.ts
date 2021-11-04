import { TUnknownComponentRenderer } from "../../rendering/t-unknown-component-renderer";
import { TGraphicsComponent } from "../../rendering/graphics-components/t-graphics-component";

/**
 * @public
 */
export interface IUpdateGroupOptions<TUpdateArg>
{
    graphicsComponent: TGraphicsComponent<TUnknownComponentRenderer, TUpdateArg, unknown>;
}