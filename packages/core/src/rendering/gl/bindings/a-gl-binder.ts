import { IGlProgramSpec } from "../gl-program-specification";
import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";
import { IBinder } from "../../generic-binders/i-binder";
import { TUnknownBufferLayout } from "../../buffers/buffer-layout";

/**
 * @public
 */
export type TGlUnknownBinder<TTransformRenderer extends TGlBasicComponentRenderer> = IGlBinder<TTransformRenderer, unknown, TUnknownBufferLayout>;

/**
 * @public
 * Data binder for webgl graphics components.
 */
export interface IGlBinder<TComponentRenderer extends TGlBasicComponentRenderer, TConnector, TBufferLayout>
    extends IBinder<TComponentRenderer>
{
    specification: IGlProgramSpec;

    updateData(connector: TConnector): void;
    updatePointers(connector: TConnector): void;
    bindUniforms(componentRenderer: TComponentRenderer): void;
    bindAttributes(componentRenderer: TComponentRenderer): void;

    areAttributesDirty(connector: TConnector): boolean;
    setBufferLayout(bufferLayout: TBufferLayout): void;
    getBufferLayout(): TBufferLayout;

    /**
     * Perform all possible updates.
     */
    update(connector: TConnector, componentRenderer: TComponentRenderer): void;
}

/**
 * @public
 * Data binder for webgl graphics components.
 */
export abstract class AGlBinder<TComponentRenderer extends TGlBasicComponentRenderer, TConnector, TBufferLayout>
    implements IGlBinder<TComponentRenderer, TConnector, TBufferLayout>
{
    public abstract binderClassificationId: symbol;

    public abstract specification: IGlProgramSpec;

    public abstract getBinderId(): string;

    public abstract initialize(componentRenderer: TComponentRenderer): void;

    public abstract updateData(connector: TConnector): void;

    public abstract updatePointers(connector: TConnector): void;

    public abstract bindAttributes(componentRenderer: TComponentRenderer): void;

    public abstract bindUniforms(componentRenderer: TComponentRenderer): void;

    public abstract areAttributesDirty(connector: TConnector): boolean

    public abstract setBufferLayout(bufferLayout: TBufferLayout): void;

    public abstract getBufferLayout(): TBufferLayout;

    public update(connector: TConnector, componentRenderer: TComponentRenderer): void
    {
        this.updateData(connector);
        this.updatePointers(connector);
        this.bindUniforms(componentRenderer);
        this.bindAttributes(componentRenderer);
    }
}