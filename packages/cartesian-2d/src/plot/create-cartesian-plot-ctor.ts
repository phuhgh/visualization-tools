import { TemporaryListener, TTypedArray } from "rc-js-util";
import { ICartesian2dPlotConstructionOptions } from "./options/cartesian2d-plot-construction-options";
import { ICartesian2dPlotRange } from "../update/cartesian2d-plot-range";
import { ICartesian2dUpdateArgProvider } from "../update/i-cartesian2d-update-arg-provider";
import { ICartesian2dUpdateArg } from "../update/cartesian2d-update-arg";
import { EntityCategory2d } from "../update/entity-category2d";
import { ICartesian2dPlotCtor } from "./i-cartesian2d-plot-ctor";
import { ICartesian2dPlotCtorArg } from "./cartesian2d-plot-ctor-arg";
import { ICategoryUpdateHooks, IEntityCategory, IGraphAttachPoint, IRenderer, OnCanvasResized, OnDprChanged, OnPlotDetached, Plot, TUnknownEntityRenderer } from "@visualization-tools/core";
import { ICartesian2dPlot } from "./i-cartesian2d-plot";

/**
 * @public
 */
export interface ICartesian2dAxisFactory<TEntityRenderer extends TUnknownEntityRenderer
    , TArray extends TTypedArray
    , TRequiredTraits>
{
    setDefaultAxis
    (
        plot: ICartesian2dPlot<TEntityRenderer, TArray, TRequiredTraits>,
        options: ICartesian2dPlotConstructionOptions<TArray, TRequiredTraits>,
        attachPoint: IGraphAttachPoint,
    )
        : void;
}

/**
 * @public
 * Generates the constructor of {@link ICartesian2dPlot}. Use a factory to create an instance ({@link CanvasCartesian2dPlotFactory},
 * {@link GlCartesian2dPlotFactory} etc) unless extending.
 */
export function createCartesianPlotCtor<TEntityRenderer extends TUnknownEntityRenderer, TArray extends TTypedArray>
(
    axisFactory: ICartesian2dAxisFactory<TEntityRenderer, TArray, unknown>,
    metaUpdateHooks: ICategoryUpdateHooks<IRenderer<TEntityRenderer>, ICartesian2dUpdateArg<TArray>>,
    dataUpdateHooks: ICategoryUpdateHooks<IRenderer<TEntityRenderer>, ICartesian2dUpdateArg<TArray>>,
)
    : ICartesian2dPlotCtor<TEntityRenderer, TArray, unknown>
{
    return class CartesianPlot<TRequiredTraits>
        extends Plot<ICartesian2dPlotRange<TArray>, TRequiredTraits>
        implements ICartesian2dPlot<TEntityRenderer, TArray, TRequiredTraits>
    {
        public updateArgProvider: ICartesian2dUpdateArgProvider<TArray, TRequiredTraits>;
        public metaCategory: IEntityCategory<TEntityRenderer, ICartesian2dUpdateArg<TArray>, TRequiredTraits>;
        public dataCategory: IEntityCategory<TEntityRenderer, ICartesian2dUpdateArg<TArray>, TRequiredTraits>;

        public constructor
        (
            arg: ICartesian2dPlotCtorArg<TArray, TRequiredTraits>,
        )
        {
            super(arg);
            const ctor = this.constructor as typeof CartesianPlot;

            this.updateArgProvider = arg.plotOptions.updateGroup.updateArgProvider;
            this.metaCategory = new EntityCategory2d(this, arg.chart.renderer, arg.plotOptions.updateGroup, ctor.metaUpdateHooks);
            this.dataCategory = new EntityCategory2d(this, arg.chart.renderer, arg.plotOptions.updateGroup, ctor.dataUpdateHooks);

            this.configureDefaults(arg.plotOptions, arg.chart.attachPoint);
            this.registerEventHandlers(arg.plotOptions);
        }

        private configureDefaults
        (
            options: ICartesian2dPlotConstructionOptions<TArray, TRequiredTraits>,
            attachPoint: IGraphAttachPoint,
        )
            : void
        {
            if (options.useDefaultAxis)
            {
                (this.constructor as typeof CartesianPlot).axisFactory.setDefaultAxis(this, options, attachPoint);
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
        private static axisFactory: ICartesian2dAxisFactory<TEntityRenderer, TArray, unknown> = axisFactory;
        private static metaUpdateHooks: ICategoryUpdateHooks<IRenderer<TEntityRenderer>, ICartesian2dUpdateArg<TArray>> = metaUpdateHooks;
        private static dataUpdateHooks: ICategoryUpdateHooks<IRenderer<TEntityRenderer>, ICartesian2dUpdateArg<TArray>> = dataUpdateHooks;
    };
}