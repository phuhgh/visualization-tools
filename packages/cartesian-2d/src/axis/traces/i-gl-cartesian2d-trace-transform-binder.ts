import { IGlTraceBinder } from "./gl-cartesian-2d-trace-binder";
import { IGlInstancedBinder, IGlTransformBinder, TGl2ComponentRenderer, TGlF32BufferLayout } from "@visualization-tools/core";
import { TGlTraceEntity } from "./t-gl-trace-entity";

/**
 * @public
 * Binds trace data to WebGL transform feedback.
 */
export interface IGlTraceTransformBinder
    extends IGlInstancedBinder<TGl2ComponentRenderer, TGlTraceEntity, TGlF32BufferLayout>,
            IGlTransformBinder<TGlTraceEntity, IGlTraceBinder, TGl2ComponentRenderer>
{
    readonly bindsOutput: boolean;
}
