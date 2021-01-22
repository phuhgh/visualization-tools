import { Cartesian2dTraceEntityConnector } from "./cartesian-2d-trace-entity-connector";
import { IncrementingIdentifierFactory, Range2d } from "rc-js-util";
import { debugDescribe, expectValueToBeNearTo } from "rc-js-test-util";

debugDescribe("=> TraceEntityConnector", () =>
{
    const dataRange = Range2d.f32.factory.createOne(0.1, 1, 0, 9.99);
    // where x belongs to the integers

    it("| has increments of 10^x if within trace count", () =>
    {
        const connector = new Cartesian2dTraceEntityConnector(Float32Array, 10, new IncrementingIdentifierFactory());
        connector.update(dataRange);
        expect(connector.getXTraceCount()).toBe(9);
        expect(connector.getXTick(0)).toBe(0.2);
        expectValueToBeNearTo(connector.getXTick(1), 0.3);
        expect(connector.getXTick(8)).toBe(1);

        expect(connector.getYTraceCount()).toBe(10);
        expect(connector.getYTick(0)).toBe(0);
        expect(connector.getYTick(1)).toBe(1);
        expect(connector.getYTick(9)).toBe(9);
    });

    it("| switches to increments 20^x where 10^x won't fit", () =>
    {
        const connector = new Cartesian2dTraceEntityConnector(Float32Array, 5, new IncrementingIdentifierFactory());
        connector.update(dataRange);
        expect(connector.getXTraceCount()).toBe(5);
        expect(connector.getXTick(0)).toBe(0.2);
        expect(connector.getXTick(1)).toBe(0.4);
        expect(connector.getXTick(4)).toBe(1);

        expect(connector.getYTraceCount()).toBe(5);
        expect(connector.getYTick(0)).toBe(0);
        expect(connector.getYTick(4)).toBe(8);
    });

    it("| switches to increments 50^x where 20^x won't fit", () =>
    {
        const connector = new Cartesian2dTraceEntityConnector(Float32Array, 4, new IncrementingIdentifierFactory());
        connector.update(dataRange);
        expect(connector.getXTraceCount()).toBe(2);
        expect(connector.getXTick(0)).toBe(0.5);
        expect(connector.getXTick(1)).toBe(1);

        expect(connector.getYTraceCount()).toBe(2);
        expect(connector.getYTick(0)).toBe(0);
        expect(connector.getYTick(1)).toBe(5);
    });

    it("| finally falls back to increments 100^x where 50^x still won't fit", () =>
    {
        const connector = new Cartesian2dTraceEntityConnector(Float32Array, 1, new IncrementingIdentifierFactory());
        connector.update(dataRange);
        expect(connector.getXTraceCount()).toBe(1);
        expect(connector.getXTick(0)).toBe(1);

        expect(connector.getYTraceCount()).toBe(1);
        expect(connector.getYTick(0)).toBe(0);
    });
});