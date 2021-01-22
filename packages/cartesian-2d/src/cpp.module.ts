import { IVisualizationToolBindings } from "@visualization-tools/core";
import { ICartesian2dBindings } from "./i-cartesian-2d-bindings";

export const exportedFunctions: { [index in Exclude<keyof ICartesian2dBindings, keyof IVisualizationToolBindings>]: boolean } = {
    _f32Interleaved2dQuadIndexer_getOffsets: true,
    _f64Interleaved2dQuadIndexer_getOffsets: true,
    _f32Interleaved2dLineQuadIndexer_index: true,
    _f64Interleaved2dLineQuadIndexer_index: true,
};
