import { _Fp, _Identifier } from "rc-js-util";
import { TGl2ComponentRenderer } from "../component-renderer/t-gl2-component-renderer";
import { ICacheable } from "../../i-cacheable";
import { ITransformProvider } from "../../transform-components/i-transform-provider";
import { IGlTransformComponent } from "./i-gl-transform-component";
import { IUserTransform } from "../../../plot/i-user-transform";
import { ITransformBinderProvider } from "../../transform-components/i-transform-binder-provider";
import { IRenderer } from "../../i-renderer";
import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";
import { IGlBinder, TGlUnknownBinder } from "../bindings/a-gl-binder";
import { IGlTransformBinder } from "../bindings/i-gl-transform-binder";
import { TChangeTrackedTrait } from "../../../entities/traits/t-change-tracked-trait";
import { ITransformProviderBufferProvider, TransformBufferProvider } from "../../transform-components/transform-buffer-provider";
import { TUnknownBufferLayout } from "../../buffers/buffer-layout";

/**
 * @public
 */
export class GlTransformProvider<TTransformRenderer extends TGl2ComponentRenderer
    , TTransformBinder extends IGlTransformBinder<unknown, TGlUnknownBinder<TTransformRenderer>, TTransformRenderer>
    , TUpdateArg
    , TEntityTraits extends TChangeTrackedTrait>
    implements ITransformProvider<TTransformRenderer, TUpdateArg, TEntityTraits>
{
    public transformComponent: IGlTransformComponent<TTransformRenderer, TGlUnknownBinder<TTransformRenderer>, TUpdateArg, TEntityTraits> | null = null;
    public readonly bufferLayoutProvider: ITransformProviderBufferProvider<TUnknownBufferLayout>;
    public groupId: number = _Identifier.getNextIncrementingId();

    public static createOne<TTransformRenderer extends TGl2ComponentRenderer
        , TBufferLayout extends TUnknownBufferLayout
        , TConnector
        , TTransformBinder extends IGlTransformBinder<TConnector, TBinder, TTransformRenderer>
        , TBinder extends IGlBinder<TGlBasicComponentRenderer, TConnector, TBufferLayout>
        , TUpdateArg
        , TEntityTraits extends TChangeTrackedTrait>
    (
        transformKey: ICacheable,
        binder: TBinder & ITransformBinderProvider<TTransformBinder>,
        getUserTransform: (updateArg: TUpdateArg) => IUserTransform,
        getEntityChangeId: (entity: TEntityTraits, updateArg: TUpdateArg) => TConnector,
    )
        : GlTransformProvider<TTransformRenderer, TTransformBinder, TUpdateArg, TEntityTraits>
    {
        return new GlTransformProvider(
            transformKey,
            binder as TGlUnknownBinder<TTransformRenderer> & ITransformBinderProvider<TTransformBinder>,
            getUserTransform,
            getEntityChangeId,
        );
    }

    public getTransformBinder(): TTransformBinder
    {
        return this.binder.getTransformBinder() as TTransformBinder;
    }

    public updateTransform(renderer: IRenderer<TTransformRenderer>, updateArg: TUpdateArg): void
    {
        type TGlTc =
            | IGlTransformComponent<TTransformRenderer, TGlUnknownBinder<TTransformRenderer>, TUpdateArg, TEntityTraits>
            | null;
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

    public isTransformRequired(entity: TEntityTraits, updateArg: TUpdateArg): boolean
    {
        if (this.transformComponent == null)
        {
            return false;
        }

        const connector = this.getBinderConnector(entity, updateArg);

        return this.binder.areAttributesDirty(connector);
    }

    protected constructor
    (
        private transformKey: ICacheable,
        private binder: TGlUnknownBinder<TTransformRenderer> & ITransformBinderProvider<TTransformBinder>,
        private getUserTransform: (updateArg: TUpdateArg) => IUserTransform,
        private getBinderConnector: (entity: TEntityTraits, updateArg: TUpdateArg) => unknown,
    )
    {
        this.bufferLayoutProvider = new TransformBufferProvider(binder);
    }
}
