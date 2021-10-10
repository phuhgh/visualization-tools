import { _Fp, _Identifier } from "rc-js-util";
import { TGl2ComponentRenderer } from "../component-renderer/t-gl2-component-renderer";
import { ICacheable } from "../../i-cacheable";
import { ITransformProvider } from "../../transform-components/i-transform-provider";
import { IGlTransformComponent } from "./i-gl-transform-component";
import { IUserTransform } from "../../../plot/i-user-transform";
import { ITransformBinderProvider } from "../../transform-components/i-transform-binder-provider";
import { IRenderer } from "../../i-renderer";
import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";
import { IGlBinder } from "../bindings/a-gl-binder";
import { IGlTransformBinder } from "../bindings/i-gl-transform-binder";

// FIXME: overkill generics
/**
 * @public
 */
export class GlTransformProvider<TTransformRenderer extends TGl2ComponentRenderer
    , TTransformBinder extends IGlTransformBinder<unknown, TSwapBinder, TTransformRenderer>
    , TSwapBinder extends IGlBinder<TGlBasicComponentRenderer, unknown>
    , TUpdateArg
    , TEntityTraits>
    implements ITransformProvider<TTransformRenderer, TUpdateArg, TEntityTraits>
{
    public transformComponent: IGlTransformComponent<TTransformRenderer, TSwapBinder, TUpdateArg, TEntityTraits> | null = null;

    /**
     * Components in the same group share transform results (they should also share buffers).
     */
    public groupId: number = _Identifier.getNextIncrementingId();

    public constructor
    (
        private transformKey: ICacheable,
        private binder: TSwapBinder & ITransformBinderProvider<TTransformBinder>,
        private getUserTransform: (updateArg: TUpdateArg) => IUserTransform,
    )
    {
    }

    public getTransformBinder(): TTransformBinder
    {
        return this.binder.getTransformBinder() as TTransformBinder;
    }

    public updateTransform(renderer: IRenderer<TTransformRenderer>, updateArg: TUpdateArg): void
    {
        type TGlTc = IGlTransformComponent<TTransformRenderer, TSwapBinder, TUpdateArg, TEntityTraits> | null;
        const userTransformId = this.getUserTransform(updateArg).userTransformId;
        this.transformComponent = _Fp.normalizeToNull(renderer.transformComponents.getTransform(userTransformId, this.transformKey)) as TGlTc;
    }

    public setOutputBuffers(entity: TEntityTraits, transformRenderer: TTransformRenderer): void
    {
        if (this.transformComponent == null)
        {
            return;
        }

        this.transformComponent.setOutputBuffers(entity, this.binder, transformRenderer);
    }

    public setGroupId(id: number): void
    {
        this.groupId = id;
    }
}
