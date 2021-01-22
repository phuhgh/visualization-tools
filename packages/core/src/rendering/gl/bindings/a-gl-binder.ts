import { IGlProgramSpec } from "../gl-program-specification";
import { ICacheable } from "../../i-cacheable";

/**
 * @public
 * Data binder for webgl graphics components.
 */
export interface IGlBinder<TConnector, TRenderer> extends ICacheable
{
    specification: IGlProgramSpec;
    initialize(entityRenderer: TRenderer): void;

    updateData(connector: TConnector, usage?: GLenum): void;
    updatePointers(connector: TConnector): void;
    bindUniforms(entityRenderer: TRenderer): void;
    bindAttributes(entityRenderer: TRenderer): void;

    /**
     * Perform all possible updates.
     */
    update(connector: TConnector, entityRenderer: TRenderer): void;
}

/**
 * @public
 * Data binder for webgl graphics components.
 */
export abstract class AGlBinder<TConnector, TRenderer>
    implements IGlBinder<TConnector, TRenderer>
{
    public abstract specification: IGlProgramSpec;

    public abstract getCacheId(): string;

    public abstract initialize(entityRenderer: TRenderer): void;

    public abstract updateData(connector: TConnector, usage?: GLenum): void;

    public abstract updatePointers(connector: TConnector): void;

    public abstract bindAttributes(entityRenderer: TRenderer): void;

    public abstract bindUniforms(entityRenderer: TRenderer): void;

    public update(connector: TConnector, entityRenderer: TRenderer): void
    {
        this.updateData(connector);
        this.updatePointers(connector);
        this.bindUniforms(entityRenderer);
        this.bindAttributes(entityRenderer);
    }
}