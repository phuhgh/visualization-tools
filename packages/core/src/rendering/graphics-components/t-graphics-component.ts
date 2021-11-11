import { TUnknownComponentRenderer } from "../t-unknown-component-renderer";
import { IGraphicsComponent } from "./i-graphics-component";
import { ICompositeGraphicsComponent } from "../../entities/components/composite-graphics-component";

/**
 * @public
 */
export type TGraphicsComponent<TComponentRenderer extends TUnknownComponentRenderer, TUpdateArg, TTraits> =
    | IGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>
    | ICompositeGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>
    ;
