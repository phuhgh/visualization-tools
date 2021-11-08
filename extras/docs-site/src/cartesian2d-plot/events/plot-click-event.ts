import { APlotEvent } from "./a-plot-event";
import { EPlotEvent } from "./e-plot-event";
import { HitTestResult, IChartPointerEvent } from "@visualization-tools/core";

export interface IPlotClickEvent<TTraits>
{
    targets: readonly HitTestResult<unknown, TTraits>[];
    $event: IChartPointerEvent<PointerEvent>;
}

export class PlotClickEvent<TTraits> extends APlotEvent<IPlotClickEvent<TTraits>>
{
    public id = EPlotEvent.PlotClick as const;

    public constructor
    (
        public arg: IPlotClickEvent<TTraits>,
    )
    {
        super();
    }
}