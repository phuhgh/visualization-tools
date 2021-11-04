import { TestCanvasChartHarness } from "../../test-utils/test-canvas-chart-harness";
import { HitTestableGroup } from "./hit-testable-group";
import { _Debug, IncrementingIdentifierFactory } from "rc-js-util";
import { ChartDataEntity } from "../chart-data-entity";
import { HitAlwaysAllowedComponent } from "../../eventing/hit-testing/hit-always-allowed-component";
import { TestHitTestComponent } from "../../test-utils/fakes/test-hit-test.component";
import { setDefaultAppTestFlags } from "rc-js-util/bin/src/debug/impl/set-debug-app-test-flags";
import { debugDescribe } from "rc-js-test-util";
import { CanvasTestPlotFactory } from "../../test-utils/fakes/canvas-test-plot-factory";
import { TestUpdateArgProvider } from "../../test-utils/fakes/test-update-arg-provider";

debugDescribe("=> HitTestableGroup", () =>
{
    let harness: TestCanvasChartHarness;
    const identifierFactory = new IncrementingIdentifierFactory();
    const hitAllowedComp = new HitAlwaysAllowedComponent();
    const dummyHitTester = new TestHitTestComponent();

    beforeEach(() =>
    {
        setDefaultAppTestFlags();
        harness = new TestCanvasChartHarness();
        harness.attachToBody();
    });

    afterEach(() =>
    {
        harness.removeFromBody();
    });

    describe("=> refCountingAddEntity", () =>
    {
        it("| adds to the group if not already present", () =>
        {
            const plot = CanvasTestPlotFactory.createOne(harness.chart);
            const group = new HitTestableGroup(new TestUpdateArgProvider(), plot);
            const entity = new ChartDataEntity({}, { zIndexAbs: 1, zIndexRel: 1 }, identifierFactory);
            plot.addEntity(entity);
            group.refCountingAddEntity(entity, { hitAllowedComponent: hitAllowedComp, hitTestComponent: dummyHitTester });

            expectDummyTester(entity, group);
        });

        it("| does nothing if present (production)", () =>
        {
            _Debug.setFlag("DEBUG_MODE", false);
            const plot = CanvasTestPlotFactory.createOne(harness.chart);
            const group = new HitTestableGroup(new TestUpdateArgProvider(), plot);
            const entity = new ChartDataEntity({}, { zIndexAbs: 1, zIndexRel: 1 }, identifierFactory);
            plot.addEntity(entity);
            group.refCountingAddEntity(entity, { hitAllowedComponent: hitAllowedComp, hitTestComponent: dummyHitTester });
            group.refCountingAddEntity(entity, { hitAllowedComponent: new HitAlwaysAllowedComponent(), hitTestComponent: new TestHitTestComponent() });

            expectDummyTester(entity, group);
        });

        it("| does nothing if present (debug)", () =>
        {
            const plot = CanvasTestPlotFactory.createOne(harness.chart);
            const group = new HitTestableGroup(new TestUpdateArgProvider(), plot);
            const entity = new ChartDataEntity({}, { zIndexAbs: 1, zIndexRel: 1 }, identifierFactory);
            plot.addEntity(entity);
            group.refCountingAddEntity(entity, { hitAllowedComponent: hitAllowedComp, hitTestComponent: dummyHitTester });
            expect(() => group.refCountingAddEntity(entity, { hitAllowedComponent: new HitAlwaysAllowedComponent(), hitTestComponent: new TestHitTestComponent() })).toThrow();

        });
    });

    describe("=> refCountingRemoveEntity", () =>
    {
        it("| removes the entity if ref 0", () =>
        {
            const plot = CanvasTestPlotFactory.createOne(harness.chart);
            const group = new HitTestableGroup(new TestUpdateArgProvider(), plot);
            const entity = new ChartDataEntity({}, { zIndexAbs: 1, zIndexRel: 1 }, identifierFactory);
            plot.addEntity(entity);
            group.refCountingAddEntity(entity, { hitAllowedComponent: hitAllowedComp, hitTestComponent: dummyHitTester });
            group.refCountingRemoveEntity(entity);
            expectEmpty(entity, group);
        });

        it("| does nothing if ref > 0", () =>
        {
            const plot = CanvasTestPlotFactory.createOne(harness.chart);
            const group = new HitTestableGroup(new TestUpdateArgProvider(), plot);
            const entity = new ChartDataEntity({}, { zIndexAbs: 1, zIndexRel: 1 }, identifierFactory);
            plot.addEntity(entity);
            group.refCountingAddEntity(entity, { hitAllowedComponent: hitAllowedComp, hitTestComponent: dummyHitTester });
            group.refCountingAddEntity(entity, { hitAllowedComponent: new HitAlwaysAllowedComponent(), hitTestComponent: dummyHitTester });
            group.refCountingRemoveEntity(entity);
            expectDummyTester(entity, group);
            group.refCountingRemoveEntity(entity);
            expectEmpty(entity, group);
        });

        it("| does nothing if no entities", () =>
        {
            const plot = CanvasTestPlotFactory.createOne(harness.chart);
            const group = new HitTestableGroup(new TestUpdateArgProvider(), plot);
            const entity = new ChartDataEntity({}, { zIndexAbs: 1, zIndexRel: 1 }, identifierFactory);
            plot.addEntity(entity);

            expectEmpty(entity, group);
        });
    });

    function expectDummyTester
    (
        entity: ChartDataEntity<unknown, {}, {}>,
        group: HitTestableGroup<unknown, unknown, unknown>,
    )
        : void
    {
        expect(group.isEntityInGroup(entity)).toBe(true);
        expect(group.getHitTester(entity)).toBe(dummyHitTester);
        const entitiesByHitTester = group.getEntitiesByHitTester();
        expect(entitiesByHitTester.length).toBe(1);
        expect(entitiesByHitTester[0][0]).toBe(dummyHitTester);
        expect(entitiesByHitTester[0][1]).toEqual([entity]);
    }

    function expectEmpty
    (
        entity: ChartDataEntity<unknown, {}, {}>,
        group: HitTestableGroup<unknown, unknown, unknown>,
    )
        : void
    {
        expect(group.isEntityInGroup(entity)).toBe(false);
        expect(() => group.getHitTester(entity)).toThrow();
        const entitiesByHitTester = group.getEntitiesByHitTester();
        expect(entitiesByHitTester.length).toBe(0);
    }
});