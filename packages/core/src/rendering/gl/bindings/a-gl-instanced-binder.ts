import { TGlInstancedComponentRenderer } from "../component-renderer/t-gl-instanced-component-renderer";
import { AGlBinder, IGlBinder } from "./a-gl-binder";
import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";

/**
 * @public
 * Instanced data binder for webgl graphics components.
 */
export interface IGlInstancedBinder<TComponentRenderer extends TGlBasicComponentRenderer, TConnector>
    extends IGlBinder<TComponentRenderer, TConnector>
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
        changeId: number,
        divisor: number,
        usage?: GLenum,
    )
        : void;
}

/**
 * @public
 * Instanced data binder for webgl graphics components.
 */
export abstract class AGlInstancedBinder<TComponentRenderer extends TGlInstancedComponentRenderer, TConnector>
    extends AGlBinder<TComponentRenderer, TConnector>
    implements IGlInstancedBinder<TComponentRenderer, TConnector>
{
    public abstract bindInstanced(componentRenderer: TComponentRenderer, divisor: number, usage?: GLenum): void;

    public updateInstanced
    (
        connector: TConnector,
        componentRenderer: TComponentRenderer,
        changeId: number,
        divisor: number,
        usage?: GLenum,
    )
        : void
    {
        this.updateData(connector, changeId);
        this.updatePointers(connector);
        this.bindUniforms(componentRenderer);
        this.bindInstanced(componentRenderer, divisor, usage);
    }
}
