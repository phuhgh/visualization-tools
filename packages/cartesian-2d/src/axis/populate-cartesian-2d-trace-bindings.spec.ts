import { IncrementingIdentifierFactory, Range2d } from "rc-js-util";
import { populateCartesian2dTraceBindings } from "./populate-cartesian-2d-trace-bindings";
import { debugDescribe } from "rc-js-test-util";
import { ChartDataEntity } from "@visualization-tools/core";
import { ICartesian2dTraceEntityConnector } from "./cartesian-2d-trace-entity-connector";

debugDescribe("populateTrace2dBindings", () =>
{
    const changeIdFactory = new IncrementingIdentifierFactory();

    it("| creates the expected buffer", () =>
    {
        const entity = new ChartDataEntity(new TestTraceConnector(), { traces: new Float32Array(40) }, changeIdFactory);
        populateCartesian2dTraceBindings(entity);

        expect(entity.graphicsSettings.traces.indexOf(0)).toBe(20);
        expect(entity.graphicsSettings.traces.slice(0, 20)).toEqual(new Float32Array([
            // x traces
            2, 3, 2, 4,
            3, 3, 3, 4,
            4, 3, 4, 4,
            // y traces
            2, 3, 4, 3,
            2, 5, 4, 5,
        ]));
    });
});

/**
 * @internal
 */
export class TestTraceConnector implements ICartesian2dTraceEntityConnector<Float32Array>
{
    public constructor
    (
        public readonly dataRange: Range2d<Float32Array> = Range2d.f32.factory.createOne(2, 4, 3, 4),
    )
    {
    }

    public getTraceCount(): number
    {
        return 5;
    }

    public getXTick(index: number): number
    {
        return index + this.dataRange.getXMin();
    }

    public getXTraceCount(): number
    {
        return 3;
    }

    public getYTick(index: number): number
    {
        return 2 * index + this.dataRange.getYMin();
    }

    public getYTraceCount(): number
    {
        return 2;
    }

    public update(): number
    {
        return 0;
    }
}