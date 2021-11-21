import { TTypedArrayCtor } from "rc-js-util";
import { ChartDataEntity, SharedInterleavedConnector } from "@visualization-tools/core";
import { IPoint2dOffsets, TPoint2dSettings } from "@visualization-tools/cartesian-2d";

export type TPointEntity<TArrayCtor extends TTypedArrayCtor>
    = ChartDataEntity<unknown, SharedInterleavedConnector<TArrayCtor, IPoint2dOffsets>, TPoint2dSettings<InstanceType<TArrayCtor>>>;