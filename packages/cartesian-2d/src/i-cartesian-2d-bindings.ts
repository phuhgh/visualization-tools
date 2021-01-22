import { IInterleavedLine2dQuadIndexerBindings } from "./indexed-point-2d/interleaved/hit-test/shared-interleaved-line-2d-quad-indexer-factory";
import { IVisualizationToolBindings } from "@visualization-tools/core";

/**
 * @public
 * Emscripten bindings exposed by cartesian 2d.
 */
export interface ICartesian2dBindings
    extends IVisualizationToolBindings,
            IInterleavedLine2dQuadIndexerBindings
{
}

