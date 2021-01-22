import { IJsUtilBindings } from "rc-js-util";
import { ISharedInterleavedConnectorBindings } from "./entities/connectors/indexed-connector/interleaved/shared-interleaved-connector";
import { ISharedQuadTreeBindings } from "./hit-testing/shared-quad-tree/shared-quad-tree";

/**
 * @public
 * Emscripten bindings exposed by core.
 */
export interface IVisualizationToolBindings
    extends IJsUtilBindings,
            ISharedInterleavedConnectorBindings,
            ISharedQuadTreeBindings
{
}
