import { IGlBinder } from "../gl/bindings/a-gl-binder";
import { TGlBasicComponentRenderer } from "../gl/component-renderer/t-gl-basic-component-renderer";
import { TUnknownBufferLayout } from "../buffers/buffer-layout";

/**
 * @public
 */
export interface ITransformProviderBufferProvider<TBufferLayout extends TUnknownBufferLayout>
{
    getBufferLayout(): TBufferLayout;
    setBufferLayout(buffer: TBufferLayout): void;
}

/**
 * @public
 */
export class TransformBufferProvider<TBinder extends IGlBinder<TGlBasicComponentRenderer, unknown, TBufferLayout>,
    TBufferLayout extends TUnknownBufferLayout>
    implements ITransformProviderBufferProvider<TBufferLayout>
{
    public constructor
    (
        private binder: TBinder,
    )
    {
    }

    public getBufferLayout(): TBufferLayout
    {
        return this.binder.getBufferLayout();
    }

    public setBufferLayout(buffer: TBufferLayout): void
    {
        this.binder.setBufferLayout(buffer);
    }
}
