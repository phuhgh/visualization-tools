import { AChartEvent } from "./a-chart-event";
import { EChartEvent } from "./e-chart-event";

export interface IOnChartInitializationErrorArg
{
    // FIXME woefully inadequate
    error: string;
}

export class OnChartInitializationErrorEvent extends AChartEvent<IOnChartInitializationErrorArg>
{
    public id = EChartEvent.OnChartInitializationError as const;

    public constructor
    (
        public arg: IOnChartInitializationErrorArg,
    )
    {
        super();
    }
}