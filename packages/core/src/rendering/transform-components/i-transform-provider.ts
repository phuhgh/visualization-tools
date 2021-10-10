import { ITransformComponent } from "./i-transform-component";
import { TUnknownComponentRenderer } from "../t-unknown-component-renderer";
import { ITransformBinder } from "../generic-binders/i-transform-binder";
import { IRenderer } from "../i-renderer";

/**
 * @public
 */
export interface ITransformProvider<TTransformRenderer extends TUnknownComponentRenderer
    , TUpdateArg
    , TEntityTraits>
{
    readonly groupId: number;
    readonly transformComponent: ITransformComponent<TTransformRenderer, TUpdateArg, TEntityTraits> | null;
    /**
     * Either a entityRenderer or shared renderer may be used.
     */
    updateTransform(componentRenderer: IRenderer<TTransformRenderer>, updateArg: TUpdateArg): void;
    setOutputBuffers(entity: TEntityTraits, transformRenderer: TTransformRenderer): void;
    setGroupId(id: number): void;
    getTransformBinder(): ITransformBinder<TTransformRenderer> | null;
}

