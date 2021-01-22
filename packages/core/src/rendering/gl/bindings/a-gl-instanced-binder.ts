import { TGlInstancedEntityRenderer } from "../entity-renderer/t-gl-instanced-entity-renderer";
import { AGlBinder, IGlBinder } from "./a-gl-binder";

/**
 * @public
 * Instanced data binder for webgl graphics components.
 */
export interface IGlInstancedBinder<TConnector, TRenderer extends TGlInstancedEntityRenderer>
    extends IGlBinder<TConnector, TRenderer>
{
    bindInstanced
    (
        entityRenderer: TRenderer,
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
        entityRenderer: TRenderer,
        divisor: number,
        usage?: GLenum,
    )
        : void;
}

/**
 * @public
 * Instanced data binder for webgl graphics components.
 */
export abstract class AGlInstancedBinder<TConnector, TRenderer extends TGlInstancedEntityRenderer>
    extends AGlBinder<TConnector, TRenderer>
    implements IGlInstancedBinder<TConnector, TRenderer>
{
    public abstract bindInstanced(entityRenderer: TRenderer, divisor: number, usage?: GLenum): void;

    public updateInstanced(connector: TConnector, entityRenderer: TRenderer, divisor: number, usage?: GLenum): void
    {
        this.updateData(connector);
        this.updatePointers(connector);
        this.bindUniforms(entityRenderer);
        this.bindInstanced(entityRenderer, divisor, usage);
    }
}