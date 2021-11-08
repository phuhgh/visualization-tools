import { TExcludeContainer } from "./t-exclude-container";
import { IChartFactory } from "./i-chart-factory";
import { IChartOptions, IChartTransformFactory, TUnknownRenderer } from "@visualization-tools/core";
import { TChartCommandChannel } from "./i-chart-component-props";

export interface IChartComponentOptions<TOptions extends IChartOptions, TRenderer extends TUnknownRenderer>
{
    constructionOptions: TExcludeContainer<TOptions>;
    chartFactory: IChartFactory<TOptions, TRenderer>;
    transforms?: {
        setTransforms: (transformFactory: IChartTransformFactory<TRenderer["TComponentRenderer"]>) => void;
        transformsToInitialize: readonly symbol[];
        /**
         * Default is true.
         */
        missIsDebugError?: boolean;
    };
    commandChannel: TChartCommandChannel;
}