import { IDataTrait } from "@visualization-tools/core";
import { TTypedArray } from "rc-js-util";
import { T2dAbsoluteZIndexTrait } from "../../traits/t2d-absolute-z-index-trait";
import { TCartesian2dAxisSettingsTrait } from "../../traits/t-cartesian-2d-axis-settings-trait";
import { TTrace2dDisplaySettingsTrait } from "../../traits/t-trace2d-display-settings-trait";
import { ICartesian2dTraceEntityConnector } from "../cartesian-2d-trace-entity-connector";

/**
 * @public
 * An entity that draws axis labels.
 */
export type TAxisLabelEntity<TArray extends TTypedArray> =
    & T2dAbsoluteZIndexTrait
    & TCartesian2dAxisSettingsTrait
    & IDataTrait<ICartesian2dTraceEntityConnector<TArray>>
    & TTrace2dDisplaySettingsTrait
    ;