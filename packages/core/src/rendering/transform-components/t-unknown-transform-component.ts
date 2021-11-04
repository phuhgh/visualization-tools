import { ITransformComponent } from "./i-transform-component";
import { IBaseComponentRenderer } from "../component-renderer/i-base-component-renderer";

/**
 * @public
 */
export type TUnknownTransformComponent<TComponentRenderer extends IBaseComponentRenderer<unknown, unknown>> = ITransformComponent<TComponentRenderer, unknown, unknown>;