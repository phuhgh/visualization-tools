import { IBinder } from "../../generic-binders/i-binder";
import { ITransformComponent } from "../../transform-components/i-transform-component";
import { ITransformComponentFactory } from "../../transform-components/i-transform-component-factory";
import { TGl2ComponentRenderer } from "../component-renderer/t-gl2-component-renderer";
import { IChartTransformFactory } from "../../../chart/chart-transform-factory";

/**
 * @public
 */
export class GlTransformComponentFactory<TBinder extends IBinder<TComponentRenderer>, TComponentRenderer extends TGl2ComponentRenderer>
    implements ITransformComponentFactory<TComponentRenderer>
{
    public constructor
    (
        public userTransformId: symbol,
        public binderId: symbol,
        public transformCtor: new (binder: TBinder) => ITransformComponent<TComponentRenderer, unknown, unknown>,
    )
    {
    }

    public createOne(binder: TBinder): ITransformComponent<TComponentRenderer, unknown, unknown>
    {
        return new this.transformCtor(binder);
    }

    public addToChart(transformFactory: IChartTransformFactory<TComponentRenderer>): void
    {
        transformFactory.addTransform(this);
    }
}