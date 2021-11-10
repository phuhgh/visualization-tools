import { TGlInstancedComponentRenderer } from "../component-renderer/t-gl-instanced-component-renderer";
import { AGlBinder, IGlBinder } from "./a-gl-binder";
import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";

/**
 * @public
 * Instanced data binder for webgl graphics components.
 */
export interface IGlInstancedBinder<TComponentRenderer extends TGlBasicComponentRenderer, TConnector, TBufferLayout>
    extends IGlBinder<TComponentRenderer, TConnector, TBufferLayout>
{
    bindInstanced
    (
        componentRenderer: TComponentRenderer,
        divisor: number,
        usage?: GLenum,
    )
        : void;

    /**
     * Perform all possible updates.
     */
    updateInstanced
    (
        connector: TConnector,
        componentRenderer: TComponentRenderer,
        divisor: number,
        usage?: GLenum,
    )
        : void;
}

/**
 * @public
 * Instanced data binder for webgl graphics components.
 */
export abstract class AGlInstancedBinder<TComponentRenderer extends TGlInstancedComponentRenderer, TConnector, TBufferLayout>
    extends AGlBinder<TComponentRenderer, TConnector, TBufferLayout>
    implements IGlInstancedBinder<TComponentRenderer, TConnector, TBufferLayout>
{
    public abstract bindInstanced(componentRenderer: TComponentRenderer, divisor: number, usage?: GLenum): void;

    public updateInstanced
    (
        connector: TConnector,
        componentRenderer: TComponentRenderer,
        divisor: number,
        usage?: GLenum,
    )
        : void
    {
        this.updateData(connector);
        this.updatePointers(connector);
        this.bindUniforms(componentRenderer);
        this.bindInstanced(componentRenderer, divisor, usage);
    }
}
