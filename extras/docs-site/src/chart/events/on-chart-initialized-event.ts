import { AChartEvent } from "./a-chart-event";
import { EChartEvent } from "./e-chart-event";
import { IChartComponent, TUnknownRenderer } from "@visualization-tools/core";

export interface IOnChartInitializedArg<TRenderer extends TUnknownRenderer>
{
    chart: IChartComponent<TRenderer>;
}

export class OnChartInitializedEvent<TRenderer extends TUnknownRenderer>
    extends AChartEvent<IOnChartInitializedArg<TRenderer>>
{
    public id = EChartEvent.OnChartInitialized as const;

    public constructor
    (
        public arg: IOnChartInitializedArg<TRenderer>,
    )
    {
        super();
    }
}