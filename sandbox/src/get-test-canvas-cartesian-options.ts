import { ICanvasEntityRenderer, IChartComponent } from "@visualization-tools/core";
import { getTestPlotOptions } from "./test-data/get-test-plot-options";
import { Range2d } from "rc-js-util";
import { CanvasCartesian2dUpdateArgProvider, Cartesian2dPlotRange, ICartesian2dPlotConstructionOptions, T2dZIndexesTrait } from "@visualization-tools/cartesian-2d";


export function getTestCanvasCartesianOptions
(
    chart: IChartComponent<ICanvasEntityRenderer>,
)
    : ICartesian2dPlotConstructionOptions<Float64Array, T2dZIndexesTrait>
{
    return getTestPlotOptions(
        new CanvasCartesian2dUpdateArgProvider(),
        Range2d.f32.factory.createOne(-1, 0, -1, 0),
        "plot lower left",
        Cartesian2dPlotRange.createOneF64(
            Range2d.f64.factory.createOne(-4, 4, -4, 4),
            Range2d.f64.factory.createOne(-2, 2, -2, 2),
            4,
            chart.attachPoint.canvasDims,
        ),
    );
}