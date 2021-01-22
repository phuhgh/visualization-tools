import { IReadonlyPlot } from "../../../plot/i-plot";
import { QuadEventTargetProvider } from "./quad-event-target-provider";
import { ICanvasDimensions } from "../../../templating/canvas-dimensions";
import { IDefaultInteractionGroups } from "../default-interaction-groups";
import { IPlotEventTargetProvider } from "../hit-test/i-plot-event-target-provider";
import { IDefaultTargets } from "../hit-test/i-default-targets";
import { ISharedEntityQuadTree } from "../../../hit-testing/shared-quad-tree/shared-entity-quad-tree";
import { _Math } from "rc-js-util";
import { IDraggableTrait } from "../../../entities/traits/i-draggable-trait";
import { IClickableTrait } from "../../../entities/traits/i-clickable-trait";
import { IHoverableTrait } from "../../../entities/traits/i-hoverable-trait";
import { IHitTestableTrait } from "../../../entities/groups/i-hit-testable-trait";
import { IQuadTreeTargetOptions } from "./i-quad-tree-target-options";

/**
 * @public
 * Incrementally updatable entity quad tree target provider. The yield time can be configured by setting {@link IQuadTreeTargetOptions.yieldTime}.
 */
export class QuadTreeEventTargetProvider<TPlotRange>
    implements IPlotEventTargetProvider<IDefaultTargets>,
               IDefaultTargets
{
    public constructor
    (
        private readonly entityTree: ISharedEntityQuadTree<unknown, IHitTestableTrait>,
        private readonly plot: IReadonlyPlot<TPlotRange, unknown>,
        private readonly interactiveGroups: IDefaultInteractionGroups<TPlotRange, unknown, ISharedEntityQuadTree<unknown, IHitTestableTrait>>,
        private readonly options: IQuadTreeTargetOptions,
    )
    {
    }

    public dragTargetProvider = new QuadEventTargetProvider<IDraggableTrait>
    (
        this.interactiveGroups.draggable,
        this.entityTree,
    );

    public clickTargetProvider = new QuadEventTargetProvider<IClickableTrait>
    (
        this.interactiveGroups.clickable,
        this.entityTree,
    );

    public hoverTargetProvider = new QuadEventTargetProvider<IHoverableTrait>
    (
        this.interactiveGroups.hoverable,
        this.entityTree,
    );

    public * update(canvasDims: ICanvasDimensions, start: number): IterableIterator<void>
    {
        const plotDimensions = this.plot.plotDimensionsOBL.cssArea.wholeRange;
        const range = _Math.min(plotDimensions.getXRange(), plotDimensions.getYRange());
        this.entityTree.sharedTree.setOptions(Math.floor(Math.log2(range)), 4);
        this.entityTree.sharedTree.setTopLevel(plotDimensions);
        const entitiesByHitTester = this.interactiveGroups.hitTestable.getEntitiesByHitTester();
        const updateArg = this.interactiveGroups.hitTestable.argProvider.getUpdateArg(this.plot, canvasDims);
        this.entityTree.update(updateArg);
        const quadTree = this.entityTree;
        const yieldTime = this.options.yieldTime;

        for (let i = 0, iEnd = entitiesByHitTester.length; i < iEnd; ++i)
        {
            const hitTestComponent = entitiesByHitTester[i][0];
            const entities = entitiesByHitTester[i][1];

            for (let j = 0, jEnd = entities.length; j < jEnd; ++j)
            {
                if (performance.now() - start > yieldTime)
                {
                    yield;
                    start = performance.now();
                }

                const entity = entities[j];
                hitTestComponent.index(entity, updateArg, quadTree);
            }
        }
    }
}