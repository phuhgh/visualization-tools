import { TTypedArray } from "rc-js-util";
import { T2dAbsoluteZIndexTrait } from "../../traits/t2d-absolute-z-index-trait";
import { TTrace2dDisplaySettingsTrait } from "../../traits/t-trace2d-display-settings-trait";
import { IDataTrait, TChangeTrackedTrait } from "@visualization-tools/core";
import { ICartesian2dTraceEntityConnector } from "../cartesian-2d-trace-entity-connector";

/**
 * @public
 * Draws traces for cartesian 2d plots.
 */
export type TTraceEntity<TArray extends TTypedArray> =
    & T2dAbsoluteZIndexTrait
    & TTrace2dDisplaySettingsTrait
    & IDataTrait<ICartesian2dTraceEntityConnector<TArray>>
    & TChangeTrackedTrait
    ;