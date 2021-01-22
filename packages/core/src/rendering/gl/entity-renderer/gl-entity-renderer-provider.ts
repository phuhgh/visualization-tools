import { TGlExtensionKeys } from "../i-gl-extensions";
import { _Map } from "rc-js-util";
import { TGlEntityRenderer } from "./gl-entity-renderer";
import { TGlContext } from "../t-gl-context";
import { IEntityRendererProvider } from "../../i-entity-renderer-provider";
import { ICacheable } from "../../i-cacheable";
import { IEntityRendererFactory } from "../../i-entity-renderer-factory";
import { IGlProgramSpec } from "../gl-program-specification";

/**
 * @public
 * Webgl1/2 implementation of {@link IEntityRendererProvider}.
 */
export class GlEntityRendererProvider<TCtx extends TGlContext>
    implements IEntityRendererProvider<TGlEntityRenderer<TCtx, TGlExtensionKeys>>
{
    public getRenderer<TExts extends TGlExtensionKeys>
    (
        graphicsComponent: ICacheable,
    )
        : TGlEntityRenderer<TCtx, TExts>
    {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.cache.get(graphicsComponent.getCacheId())!;
    }

    public initializeRenderer<TExts extends TGlExtensionKeys>
    (
        graphicsComponent: ICacheable,
        create: () => TGlEntityRenderer<TCtx, TGlExtensionKeys>,
    )
        : TGlEntityRenderer<TCtx, TExts>
    {
        return _Map.initializeGet(this.cache, graphicsComponent.getCacheId(), create);
    }

    public reinitializeRenderers
    (
        factory: IEntityRendererFactory<IGlProgramSpec, TGlEntityRenderer<TCtx, TGlExtensionKeys>>,
    )
        : void
    {
        this.cache.forEach((renderer, key) =>
        {
            this.cache.set(key, factory.createRenderer(renderer.specification));
        });
    }

    private cache = new Map<string, TGlEntityRenderer<TCtx, TGlExtensionKeys>>();
}
