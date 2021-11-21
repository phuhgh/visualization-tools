import { OnChartInitializedEvent } from "./on-chart-initialized-event";
import { OnChartInitializationErrorEvent } from "./on-chart-initialization-error-event";
import { TUnknownRenderer } from "@visualization-tools/core";

export type TChartEvents<TRenderer extends TUnknownRenderer> =
    | OnChartInitializedEvent<TRenderer>
    | OnChartInitializationErrorEvent
    ;