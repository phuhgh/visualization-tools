import { MinimizeDemoEvent } from "./minimize-demo-event";
import { ProxyPlotCommand } from "./proxy-plot-command";
import { MaximizeDemoEvent } from "./maximize-demo-event";
import { ResetDemoEvent } from "./reset-demo-event";
import { EntitySelectionChangedEvent } from "./entity-selection-changed-event";

export type TDemoEvents<TTraits> =
    | MinimizeDemoEvent
    | MaximizeDemoEvent
    | ProxyPlotCommand<TTraits>
    | ResetDemoEvent
    | EntitySelectionChangedEvent<TTraits>
    ;