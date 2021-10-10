import { IGlProgramSpec } from "../gl-program-specification";
import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";
import { IBinder } from "../../generic-binders/i-binder";

/**
 * @public
 * Data binder for webgl graphics components.
 */
export interface IGlBinder<TComponentRenderer extends TGlBasicComponentRenderer, TConnector>
    extends IBinder<TComponentRenderer>
{
    specification: IGlProgramSpec;

    updateData(connector: TConnector, changeId: number): void;
    updatePointers(connector: TConnector): void;
    bindUniforms(componentRenderer: TComponentRenderer): void;
    bindAttributes(componentRenderer: TComponentRenderer): void;

    /**
     * Perform all possible updates.
     */
    update(connector: TConnector, componentRenderer: TComponentRenderer, changeId: number): void;
}

/**
 * @public
 * Data binder for webgl graphics components.
 */
export abstract class AGlBinder<TComponentRenderer extends TGlBasicComponentRenderer, TConnector>
    implements IGlBinder<TComponentRenderer, TConnector>
{
    public abstract binderClassificationId: symbol;

    public abstract specification: IGlProgramSpec;

    public abstract getBinderId(): string;

    public abstract initialize(componentRenderer: TComponentRenderer): void;

    public abstract updateData(connector: TConnector, changeId: number): void;

    public abstract updatePointers(connector: TConnector): void;

    public abstract bindAttributes(componentRenderer: TComponentRenderer): void;

    public abstract bindUniforms(componentRenderer: TComponentRenderer): void;

    public update(connector: TConnector, componentRenderer: TComponentRenderer, changeId: number): void
    {
        this.updateData(connector, changeId);
        this.updatePointers(connector);
        this.bindUniforms(componentRenderer);
        this.bindAttributes(componentRenderer);
    }
}