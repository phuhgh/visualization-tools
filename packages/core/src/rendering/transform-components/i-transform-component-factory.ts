import { IBinder } from "../generic-binders/i-binder";
import { ITransformComponent } from "./i-transform-component";
import { TUnknownComponentRenderer } from "../t-unknown-component-renderer";
import { IChartTransformFactory } from "../../chart/chart-transform-factory";

/**
 * @public
 * Transforms components can define a factory / factories so that {@link ChartTransformFactory} can automatically hook
 * these up at run time. Usage not mandatory, transforms can be registered directly with the renderer.
 */
export interface ITransformComponentFactory<TComponentRenderer extends TUnknownComponentRenderer>
{
    /**
     * Matches up with the user transform symbol id.
     */
    userTransformId: symbol;
    /**
     * Matches the transform to to the binders that it supports.
     */
    binderId: symbol;

    createOne(binder: IBinder<TComponentRenderer>): ITransformComponent<TComponentRenderer, unknown, unknown>;
    addToChart(transformFactory: IChartTransformFactory<TComponentRenderer>): void;
}
