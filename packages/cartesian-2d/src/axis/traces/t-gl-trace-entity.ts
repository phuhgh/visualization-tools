import { TTraceEntity } from "./t-trace-entity";
import { TTrace2dBindingsTrait } from "../../traits/t-trace2d-bindings-trait";

/**
 * @public
 * An entity that draws traces in cartesian 2d plot.
 */
export type TGlTraceEntity =
    & TTraceEntity<Float32Array>
    & TTrace2dBindingsTrait
    ;