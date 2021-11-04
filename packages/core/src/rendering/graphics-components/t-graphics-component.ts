import { TUnknownComponentRenderer } from "../t-unknown-component-renderer";
import { IGraphicsComponent } from "./i-graphics-component";
import { ICompositeGraphicsComponent } from "../../entities/components/composite-graphics-component";

/**
 * @public
 */
export type TGraphicsComponent<TComponentRenderer extends TUnknownComponentRenderer, TUpdateArg, TEntityTraits> =
    | IGraphicsComponent<TComponentRenderer, TUpdateArg, TEntityTraits>
    | ICompositeGraphicsComponent<TComponentRenderer, TUpdateArg, TEntityTraits>
    ;
