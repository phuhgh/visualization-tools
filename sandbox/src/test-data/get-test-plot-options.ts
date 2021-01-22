import { Cartesian2dAxisLabelConfig, CartesianPlotConstructionOptions, EScreenUnit, ICartesian2dGutterOptions, ICartesian2dPlotConstructionOptions, ICartesian2dPlotRange, ICartesian2dTraceOptions, ICartesian2dUpdateArgProvider, Scene2dCategorySorted, Sorted2dUpdateStrategy, T2dZIndexesTrait, Update2dGroup } from "@visualization-tools/cartesian-2d";
import { Margin2d, RgbaColorPacker, TF32Range2d, TTypedArray } from "rc-js-util";

const gutterOptions: ICartesian2dGutterOptions = {
    margins: Margin2d.f32.factory.createOne(50, 20, 10, 30),
    unit: EScreenUnit.CssPixel,
};
const axisOptions = new Cartesian2dAxisLabelConfig({
    fontFamilies: ["sans-serif"],
    fontSize: 12,
    maxWidth: 50,
    formatNumber: (value: number) => value.toPrecision(3),
    textColor: RgbaColorPacker.packColor(240, 240, 240, 255),
    padding: 14,
});

const traceOptions: ICartesian2dTraceOptions = {
    traceColor: RgbaColorPacker.packColor(0, 201, 201, 255),
    maxTraceCount: 5,
    traceLinePixelSize: 5,
};

export function getTestPlotOptions<TArray extends TTypedArray>
(
    updateArgProvider: ICartesian2dUpdateArgProvider<TArray, T2dZIndexesTrait>,
    plotPosition: TF32Range2d,
    plotName: string,
    plotRange: ICartesian2dPlotRange<TArray>,
)
    : ICartesian2dPlotConstructionOptions<TArray, T2dZIndexesTrait>
{
    return new CartesianPlotConstructionOptions<TArray, T2dZIndexesTrait>({
        plotName: plotName,
        plotRange: plotRange,
        gutterOptions: gutterOptions,
        plotPosition: plotPosition,
        axisConfig: axisOptions,
        traceOptions: traceOptions,
        updateGroup: new Update2dGroup(updateArgProvider),
        createUpdateStrategy: (plot, updateGroup) =>
        {
            return new Sorted2dUpdateStrategy(plot, updateGroup, new Scene2dCategorySorted(updateGroup));
        },
    });
}