import { debugDescribe } from "rc-js-test-util";
import { TestCanvasChartHarness } from "../../test-utils/test-canvas-chart-harness";
import { IncrementingIdentifierFactory } from "rc-js-util";
import { HitAlwaysAllowedComponent } from "../../eventing/hit-testing/hit-always-allowed-component";
import { TestHitTestComponent } from "../../test-utils/fakes/test-hit-test.component";
import { setDefaultAppTestFlags } from "rc-js-util/bin/src/debug/impl/set-debug-app-test-flags";
import { InteractionGroup } from "./interaction-group";
import { HitTestableGroup } from "./hit-testable-group";
import { ChartDataEntity } from "../chart-data-entity";
import { CanvasTestPlotFactory } from "../../test-utils/fakes/canvas-test-plot-factory";
import { TestUpdateArgProvider } from "../../test-utils/fakes/test-update-arg-provider";

debugDescribe("=> InteractionGroup", () =>
{
    let harness: TestCanvasChartHarness;
    const identifierFactory = new IncrementingIdentifierFactory();
    const hitAllowedComponent = new HitAlwaysAllowedComponent();

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

    describe("=> add entity to group", () =>
    {
        it("| adds to the existing mask", () =>
        {
            const plot = CanvasTestPlotFactory.createOne(harness.chart);
            const hitTestableGroup = new HitTestableGroup(new TestUpdateArgProvider(), plot);
            const interactionGroup = new InteractionGroup(1 << 0, hitTestableGroup, plot);
            const entity = new ChartDataEntity({}, { zIndexAbs: 1, zIndexRel: 1 }, identifierFactory);
            entity.groupMask = 1 << 1;

            plot.addEntity(entity);
            plot.addToGroup(entity, interactionGroup, { hitAllowedComponent: hitAllowedComponent, hitTestComponent: new TestHitTestComponent() });
            expect(entity.groupMask).toBe(0b11);
            expect(interactionGroup.isEntityInGroup(entity)).toBe(true);
            expect(interactionGroup.hitAllowedComponentStore.getComponent(entity)).toBe(hitAllowedComponent);
        });
    });

    describe("=> remove entity from group", () =>
    {
        it("| adds to the existing mask", () =>
        {
            const plot = CanvasTestPlotFactory.createOne(harness.chart);
            const hitTestableGroup = new HitTestableGroup(new TestUpdateArgProvider(), plot);
            const interactionGroup = new InteractionGroup(1 << 0, hitTestableGroup, plot);
            const entity = new ChartDataEntity({}, { zIndexAbs: 1, zIndexRel: 1 }, identifierFactory);
            entity.groupMask = 1 << 1;

            plot.addEntity(entity);
            plot.addToGroup(entity, interactionGroup, { hitAllowedComponent: hitAllowedComponent, hitTestComponent: new TestHitTestComponent() });
            plot.removeFromGroup(entity, interactionGroup);

            expect(entity.groupMask).toBe(0b10);
            expect(interactionGroup.isEntityInGroup(entity)).toBe(false);
            expect(() => interactionGroup.hitAllowedComponentStore.getComponent(entity)).toThrow();
        });
    });
});