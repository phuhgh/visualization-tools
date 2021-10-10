import { _Map } from "rc-js-util";
import { TGlComponentRenderer } from "./gl-component-renderer";
import { TGlContext } from "../t-gl-context";
import { IComponentRendererProvider } from "../../component-renderer/i-component-renderer-provider";
import { ICacheable } from "../../i-cacheable";
import { IComponentRendererFactory } from "../../component-renderer/i-component-renderer-factory";
import { IGlProgramSpec } from "../gl-program-specification";

/**
 * @public
 * Webgl1/2 implementation of {@link IComponentRendererProvider}.
 */
export class GlComponentRendererProvider<TComponentRenderer extends TGlComponentRenderer<TGlContext, never>>
    implements IComponentRendererProvider<TComponentRenderer>
{
    public getRenderer
    (
        graphicsComponent: ICacheable,
    )
        : TComponentRenderer
    {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.cache.get(graphicsComponent.getCacheId())!;
    }

    public initializeRenderer
    (
        graphicsComponent: ICacheable,
        create: () => TComponentRenderer,
    )
        : TComponentRenderer
    {
        return _Map.initializeGet(this.cache, graphicsComponent.getCacheId(), create);
    }

    public onContextLost(): void
    {
        this.cache.forEach((componentRenderer) =>
        {
            componentRenderer.onContextLost();
        });
    }

    public reinitializeRenderers
    (
        factory: IComponentRendererFactory<IGlProgramSpec, TComponentRenderer>,
    )
        : void
    {
        this.cache.forEach((renderer, key) =>
        {
            this.cache.set(key, factory.createRenderer(renderer.specification));
        });
    }

    private cache = new Map<string, TComponentRenderer>();
}
