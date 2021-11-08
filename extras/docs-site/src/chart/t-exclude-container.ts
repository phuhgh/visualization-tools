import { TPickExcept } from "rc-js-util";
import { IChartOptions } from "@visualization-tools/core";

export type TExcludeContainer<TOptions extends IChartOptions> = TPickExcept<TOptions, "chartContainer">;