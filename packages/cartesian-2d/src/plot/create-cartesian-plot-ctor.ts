import { TemporaryListener, TTypedArray } from "rc-js-util";
import { ICartesian2dPlotConstructionOptions } from "./options/cartesian2d-plot-construction-options";
import { ICartesian2dPlotRange } from "../update/update-arg/cartesian2d-plot-range";
import { ICartesian2dUpdateArgProvider } from "../update/update-arg/i-cartesian2d-update-arg-provider";
import { ICartesian2dUpdateArg } from "../update/update-arg/cartesian2d-update-arg";
import { EntityCategory2d } from "../update/update-group/entity-category2d";
import { ICartesian2dPlotCtor } from "./i-cartesian2d-plot-ctor";
import { ICartesian2dPlotCtorArg } from "./cartesian2d-plot-ctor-arg";
import { ICategoryUpdateHooks, IChartComponent, IEntityCategory, IRenderer, OnCanvasResized, OnDprChanged, OnPlotDetached, Plot, TUnknownComponentRenderer, TUnknownRenderer } from "@visualization-tools/core";
import { ICartesian2dPlot } from "./i-cartesian2d-plot";

/**
 * @public
 */
export interface ICartesian2dAxisFactory<TComponentRenderer extends TUnknownComponentRenderer
    , TArray extends TTypedArray
    , TRequiredTraits>
{
    setDefaultAxis
    (
        plot: ICartesian2dPlot<TComponentRenderer, TArray, TRequiredTraits>,
        options: ICartesian2dPlotConstructionOptions<TArray, TRequiredTraits>,
        chartComponent: IChartComponent<TUnknownRenderer>,
    )
        : void;
}

/**
 * @public
 * Generates the constructor of {@link ICartesian2dPlot}. Use a factory to create an instance ({@link CanvasCartesian2dPlotFactory},
 * {@link GlCartesian2dPlotFactory} etc) unless extending.
 */
export function createCartesianPlotCtor<TComponentRenderer extends TUnknownComponentRenderer, TArray extends TTypedArray>
(
    axisFactory: ICartesian2dAxisFactory<TComponentRenderer, TArray, unknown>,
    metaUpdateHooks: ICategoryUpdateHooks<IRenderer<TComponentRenderer>, ICartesian2dUpdateArg<TArray>>,
    dataUpdateHooks: ICategoryUpdateHooks<IRenderer<TComponentRenderer>, ICartesian2dUpdateArg<TArray>>,
)
    : ICartesian2dPlotCtor<TComponentRenderer, TArray, unknown>
{
    return class CartesianPlot<TRequiredTraits>
        extends Plot<ICartesian2dPlotRange<TArray>, TRequiredTraits>
        implements ICartesian2dPlot<TComponentRenderer, TArray, TRequiredTraits>
    {
        public updateArgProvider: ICartesian2dUpdateArgProvider<TArray, TRequiredTraits>;
        public metaCategory: IEntityCategory<TComponentRenderer, ICartesian2dUpdateArg<TArray>, TRequiredTraits>;
        public dataCategory: IEntityCategory<TComponentRenderer, ICartesian2dUpdateArg<TArray>, TRequiredTraits>;

        public constructor
        (
            arg: ICartesian2dPlotCtorArg<TArray, TRequiredTraits>,
        )
        {
            super(arg);
            const ctor = this.constructor as typeof CartesianPlot;

            this.updateArgProvider = arg.plotOptions.updateGroup.updateArgProvider;
            this.metaCategory = new EntityCategory2d(this, arg.chart.renderer as IRenderer<TComponentRenderer>, arg.plotOptions.updateGroup, ctor.metaUpdateHooks);
            this.dataCategory = new EntityCategory2d(this, arg.chart.renderer as IRenderer<TComponentRenderer>, arg.plotOptions.updateGroup, ctor.dataUpdateHooks);

            this.configureDefaults(arg.plotOptions, arg.chart);
            this.registerEventHandlers(arg.plotOptions);
        }

        private configureDefaults
        (
            options: ICartesian2dPlotConstructionOptions<TArray, TRequiredTraits>,
            chartComponent: IChartComponent<TUnknownRenderer>,
        )
            : void
        {
            if (options.useDefaultAxis)
            {
                (this.constructor as typeof CartesianPlot).axisFactory.setDefaultAxis(this, options, chartComponent);
            }
        }

        private registerEventHandlers(options: ICartesian2dPlotConstructionOptions<TArray, TRequiredTraits>): void
        {
            OnPlotDetached.registerListener(this, () => this.plotListeners.clearingEmit());

            this.plotListeners.addListener(OnCanvasResized.registerListener(this.eventService, () =>
            {
                this.setPlotArea(options.getPlotArea(this.attachPoint));
            }));

            this.plotListeners.addListener(OnDprChanged.registerListener(this.eventService, (dpr) =>
            {
                options.axisConfig.regenerate(dpr);
            }));
        }

        private plotListeners = new TemporaryListener<[]>();
        private static axisFactory: ICartesian2dAxisFactory<TComponentRenderer, TArray, unknown> = axisFactory;
        private static metaUpdateHooks: ICategoryUpdateHooks<IRenderer<TComponentRenderer>, ICartesian2dUpdateArg<TArray>> = metaUpdateHooks;
        private static dataUpdateHooks: ICategoryUpdateHooks<IRenderer<TComponentRenderer>, ICartesian2dUpdateArg<TArray>> = dataUpdateHooks;
    };
}