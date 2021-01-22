import { TTypedArray } from "rc-js-util";
import { TTrace2dBindingsTrait } from "../traits/t-trace2d-bindings-trait";
import { IDataTrait } from "@visualization-tools/core";
import { ICartesian2dTraceEntityConnector } from "./cartesian-2d-trace-entity-connector";

/**
 * @public
 * Generates a typed array buffer of the entities current traces. Output structure is of the form [xMin, yMin, xMax, yMax]
 * per trace, where min and max are the extrema of the data range being drawn. Vertical traces come first.
 */
export function populateCartesian2dTraceBindings
(
    entity: TTrace2dBindingsTrait & IDataTrait<ICartesian2dTraceEntityConnector<TTypedArray>>,
)
    : void
{
    // FIXME allow inversion of direction (would prevent graphics component from needed to know about which side to put labels)
    const connector = entity.data;
    const buffer = entity.graphicsSettings.traces;
    const yMin = connector.dataRange.getYMin();
    const yMax = connector.dataRange.getYMax();
    const xTraceCount = connector.getXTraceCount();

    for (let i = 0, iEnd = xTraceCount, bufferIndex = 0; i < iEnd; ++i)
    {
        const xTick = connector.getXTick(i);
        buffer[bufferIndex] = xTick;
        buffer[bufferIndex + 1] = yMin;
        buffer[bufferIndex + 2] = xTick;
        buffer[bufferIndex + 3] = yMax;
        bufferIndex += 4;
    }

    const xMin = connector.dataRange.getXMin();
    const xMax = connector.dataRange.getXMax();

    for (let i = 0, iEnd = connector.getYTraceCount(), bufferIndex = xTraceCount * 4; i < iEnd; ++i)
    {
        const yTick = connector.getYTick(i);
        buffer[bufferIndex] = xMin;
        buffer[bufferIndex + 1] = yTick;
        buffer[bufferIndex + 2] = xMax;
        buffer[bufferIndex + 3] = yTick;
        bufferIndex += 4;
    }
}