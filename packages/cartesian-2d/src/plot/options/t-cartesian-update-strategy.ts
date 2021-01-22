import { TTypedArray } from "rc-js-util";
import { T2dUpdateGroup } from "./t2d-update-group";
import { IPlotUpdateStrategy } from "@visualization-tools/core";

/**
 * @public
 */
export type TCartesianUpdateStrategy<TArray extends TTypedArray, TRequiredTraits> =
    IPlotUpdateStrategy<T2dUpdateGroup<TArray, TRequiredTraits>>
    ;
