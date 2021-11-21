import { TestCanvasChartHarness } from "../test-utils/test-canvas-chart-harness";
import { IncrementingIdentifierFactory } from "rc-js-util";
import { ChartEntity, IChartEntity } from "../entities/chart-entity";
import { OnEntityAdded } from "./events/on-entity-added";
import { OnEntityRemoved } from "./events/on-entity-removed";
import { TestGroup } from "../test-utils/fakes/test-group";
import { OnEntityRemovedFromGroup } from "./events/on-entity-removed-from-group";
import { OnEntityAddedToGroup } from "./events/on-entity-added-to-group";
import { debugDescribe } from "rc-js-test-util";
import { TestCanvasPlotFactory } from "../test-utils/fakes/test-canvas-plot-factory";
import { IPlot } from "./i-plot";
import { IPlotRange } from "./i-plot-range";

debugDescribe("=> plot", () =>
{
    let harness: TestCanvasChartHarness;
    let plot: IPlot<IPlotRange, unknown>;
    const identifierFactory = new IncrementingIdentifierFactory();

    beforeEach(() =>
    {
        harness = new TestCanvasChartHarness();

        plot = harness.chart.addPlot(TestCanvasPlotFactory.createOne(harness.chart));
    });

    describe("=> addEntity", () =>
    {
        it("| emits event if not already added", () =>
        {
            const entity = new ChartEntity(identifierFactory);
            let emittedEntity: IChartEntity<unknown> | undefined;
            OnEntityAdded.registerListener(plot, (entity) => emittedEntity = entity);
            plot.addEntity(entity);
            expect(emittedEntity).toBe(entity);
        });

        it("| emits nothing if already added", () =>
        {
            const entity = new ChartEntity(identifierFactory);
            plot.addEntity(entity);
            let emittedEntity: IChartEntity<unknown> | undefined;
            OnEntityAdded.registerListener(plot, (entity) => emittedEntity = entity);
            plot.addEntity(entity);
            expect(emittedEntity).toBe(undefined);
        });

        it("| sets the change id", () =>
        {
            const prev = identifierFactory.getNextId();
            const entity = new ChartEntity(identifierFactory);
            plot.addEntity(entity);
            expect(entity.changeId).toBe(prev + 1);
        });
    });

    describe("=> removeEntity", () =>
    {
        it("| emits event if present", () =>
        {
            const entity = new ChartEntity(identifierFactory);
            let emittedEntity: IChartEntity<unknown> | undefined;
            plot.addEntity(entity);
            OnEntityRemoved.registerListener(plot, (entity) => emittedEntity = entity);
            plot.removeEntity(entity);
            expect(emittedEntity).toBe(entity);
        });

        it("| emits nothing if not present", () =>
        {
            const entity = new ChartEntity(identifierFactory);
            let emittedEntity: IChartEntity<unknown> | undefined;
            plot.addEntity(entity);
            plot.removeEntity(entity);
            OnEntityRemoved.registerListener(plot, (entity) => emittedEntity = entity);
            plot.removeEntity(entity);
            expect(emittedEntity).toBe(undefined);
        });

        it("| is removed from groups", () =>
        {
            const group = new TestGroup();
            const entity = new ChartEntity(identifierFactory);
            let emittedEntity: IChartEntity<unknown> | undefined;
            plot.addEntity(entity);
            plot.addToGroup(entity, group, {});
            OnEntityRemovedFromGroup.registerOneTimeListener(plot, (entity) => emittedEntity = entity);
            plot.removeEntity(entity);
            expect(emittedEntity).toBe(entity);
            expect(group.isEntityInGroup(entity)).toBe(false);
        });
    });

    describe("=> addToGroup", () =>
    {
        it("| emits event on adding", () =>
        {
            const group = new TestGroup();
            const entity = new ChartEntity(identifierFactory);
            let emittedEntity: IChartEntity<unknown> | undefined;
            plot.addEntity(entity);
            OnEntityAddedToGroup.registerOneTimeListener(plot, (entity) => emittedEntity = entity);
            plot.addToGroup(entity, group, {});
            expect(emittedEntity).toBe(entity);
            expect(group.isEntityInGroup(entity)).toBe(true);
        });

        it("| doesn't emit if already in group", () =>
        {
            const group = new TestGroup();
            const entity = new ChartEntity(identifierFactory);
            let emittedEntity: IChartEntity<unknown> | undefined;
            plot.addEntity(entity);
            plot.addToGroup(entity, group, {});
            OnEntityAddedToGroup.registerOneTimeListener(plot, (entity) => emittedEntity = entity);
            plot.addToGroup(entity, group, {});
            expect(emittedEntity).toBe(undefined);
            expect(group.isEntityInGroup(entity)).toBe(true);
        });
    });

    describe("=> removeFromGroup", () =>
    {
        it("| emits event on removal", () =>
        {
            const group = new TestGroup();
            const entity = new ChartEntity(identifierFactory);
            let emittedEntity: IChartEntity<unknown> | undefined;
            plot.addEntity(entity);
            plot.addToGroup(entity, group, {});
            OnEntityRemovedFromGroup.registerOneTimeListener(plot, (entity) => emittedEntity = entity);
            plot.removeFromGroup(entity, group);
            expect(emittedEntity).toBe(entity);
            expect(group.isEntityInGroup(entity)).toBe(false);
        });

        it("| doesn't emit if already removed", () =>
        {
            const group = new TestGroup();
            const entity = new ChartEntity(identifierFactory);
            let emittedEntity: IChartEntity<unknown> | undefined;
            plot.addEntity(entity);
            plot.addToGroup(entity, group, {});
            plot.removeFromGroup(entity, group);
            OnEntityRemovedFromGroup.registerOneTimeListener(plot, (entity) => emittedEntity = entity);
            plot.removeFromGroup(entity, group);
            expect(emittedEntity).toBe(undefined);
            expect(group.isEntityInGroup(entity)).toBe(false);
        });
    });

    describe("=> getEntitiesInGroup", () =>
    {
        it("| returns an empty array if there are no entities", () =>
        {
            expect(plot.getEntitiesInGroup(new TestGroup()).length).toBe(0);
        });

        it("| returns entities in the group", () =>
        {
            const group = new TestGroup();
            const entity1 = new ChartEntity(identifierFactory);
            plot.addEntity(entity1);
            plot.addToGroup(entity1, group, {});
            const entity2 = new ChartEntity(identifierFactory);
            plot.addEntity(entity2);
            plot.addToGroup(entity2, group, {});

            expect(plot.getEntitiesInGroup(group)).toEqual([entity1, entity2]);
        });
    });
});

