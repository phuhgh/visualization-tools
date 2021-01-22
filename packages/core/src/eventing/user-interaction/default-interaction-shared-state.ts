import { IInteractionSharedState } from "./i-interaction-shared-state";
import { IDefaultTargets } from "./hit-test/i-default-targets";
import { IChartPointerEvent } from "./internal-events/chart-pointer-event";
import { _Array, _Map, _Set } from "rc-js-util";
import { HitTestResult } from "./hit-test/hit-test-result";
import { IPlotInteractionProviders } from "./plot-interaction-providers";
import { IClickableTrait } from "../../entities/traits/i-clickable-trait";
import { TEntityTrait } from "../../entities/traits/t-entity-trait";
import { EHoverState, IHoverableTrait } from "../../entities/traits/i-hoverable-trait";
import { IHitTestableTrait } from "../../entities/groups/i-hit-testable-trait";
import { EEntityUpdateFlag } from "../../update/e-entity-update-flag";

export class DefaultInteractionSharedState<TPlotRange>
    implements IInteractionSharedState
{
    public dragTargets: HitTestResult<unknown, IHitTestableTrait>[] | null = null;

    public constructor
    (
        private readonly providers: IPlotInteractionProviders<TPlotRange, IDefaultTargets>,
    )
    {
    }

    public clearAllHoveredEntities(chartEvent: IChartPointerEvent<PointerEvent>): void
    {
        const updateFlag = emitHoverLeftEvents(chartEvent, _Map.valuesToArray(this.hoveredEntities));
        this.hoveredEntities.clear();

        if (updateFlag !== EEntityUpdateFlag.NoUpdateRequired)
        {
            this.providers.callbacks.onEntityRequiresUpdate(updateFlag);
        }
    }

    public onHover(chartEvent: IChartPointerEvent<PointerEvent>): void
    {
        const hoverTargets = this.providers.eventTargets.hoverTargetProvider.hitTestPlot(chartEvent);
        const hoverTargetsByEntity = _Array.index(hoverTargets, target => target.entity);

        const newlyHoveredMap = _Map.setDifference(hoverTargetsByEntity, this.hoveredEntities);
        const noLongerHoveredMap = _Map.setDifference(this.hoveredEntities, hoverTargetsByEntity);
        const stillHovered = _Map.intersect(hoverTargetsByEntity, this.hoveredEntities);
        const newlyHovered = _Map.valuesToArray(newlyHoveredMap);
        const noLongerHovered = _Map.valuesToArray(noLongerHoveredMap);

        stillHovered.forEach((target, key) =>
        {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const newTarget = this.hoveredEntities.get(key)!;

            if (_Set.isSetEqual(newTarget.segmentIds, target.segmentIds))
            {
                stillHovered.delete(key);
            }
        });

        const stillHoveredArray = _Map.valuesToArray(stillHovered);
        let updateFlag = emitHoverLeftEvents(chartEvent, noLongerHovered);
        updateFlag |= emitHoverEnterEvents(chartEvent, newlyHovered);
        updateFlag |= emitSegmentChangeEvents(chartEvent, stillHoveredArray);

        this.hoveredEntities = hoverTargetsByEntity;

        if (newlyHovered.length > 0 || stillHoveredArray.length > 0 || noLongerHovered.length > 0)
        {
            this.providers.callbacks.onHover(newlyHovered, stillHoveredArray, noLongerHovered, chartEvent);
        }

        if (updateFlag !== EEntityUpdateFlag.NoUpdateRequired)
        {
            this.providers.callbacks.onEntityRequiresUpdate(updateFlag);
        }
    }

    public onClick(chartEvent: IChartPointerEvent<PointerEvent>): void
    {
        const targets = this.providers.eventTargets.clickTargetProvider.hitTestPlot(chartEvent);
        const updateFlag = emitClickEvents(targets, chartEvent);
        this.providers.callbacks.onClick(targets, chartEvent);

        if (updateFlag !== EEntityUpdateFlag.NoUpdateRequired)
        {
            this.providers.callbacks.onEntityRequiresUpdate(updateFlag);
        }
    }

    public onDblClick(chartEvent: IChartPointerEvent<PointerEvent>): void
    {
        const targets = this.providers.eventTargets.clickTargetProvider.hitTestPlot(chartEvent);
        const updateFlag = emitDblClickEvents(targets, chartEvent);
        this.providers.callbacks.onDoubleClick(targets, chartEvent);

        if (updateFlag !== EEntityUpdateFlag.NoUpdateRequired)
        {
            this.providers.callbacks.onEntityRequiresUpdate(updateFlag);
        }
    }

    private hoveredEntities = new Map<TEntityTrait<unknown, IHitTestableTrait>, HitTestResult<unknown, IHitTestableTrait>>();
}

function emitHoverLeftEvents
(
    chartEvent: IChartPointerEvent<PointerEvent>,
    targets: HitTestResult<unknown, IHoverableTrait>[],
)
    : EEntityUpdateFlag
{
    let updateFlag: EEntityUpdateFlag = EEntityUpdateFlag.NoUpdateRequired;

    for (let i = 0, iEnd = targets.length; i < iEnd; ++i)
    {
        const target = targets[i];

        if (target.entity.onHoverChange != null)
        {
            updateFlag |= target.entity.onHoverChange(EHoverState.Left, target.segmentIds, chartEvent);
        }
    }

    return updateFlag;
}

function emitHoverEnterEvents
(
    chartEvent: IChartPointerEvent<PointerEvent>,
    targets: HitTestResult<unknown, IHoverableTrait>[],
)
    : EEntityUpdateFlag
{
    let updateFlag: EEntityUpdateFlag = EEntityUpdateFlag.NoUpdateRequired;

    for (let i = 0, iEnd = targets.length; i < iEnd; ++i)
    {
        const target = targets[i];

        if (target.entity.onHoverChange != null)
        {
            updateFlag |= target.entity.onHoverChange(EHoverState.Entered, target.segmentIds, chartEvent);
        }
    }

    return updateFlag;
}

function emitSegmentChangeEvents
(
    chartEvent: IChartPointerEvent<PointerEvent>,
    targets: HitTestResult<unknown, IHoverableTrait>[],
)
    : EEntityUpdateFlag
{
    let updateFlag: EEntityUpdateFlag = EEntityUpdateFlag.NoUpdateRequired;

    for (let i = 0, iEnd = targets.length; i < iEnd; ++i)
    {
        const target = targets[i];

        if (target.entity.onHoverChange != null)
        {
            updateFlag |= target.entity.onHoverChange(EHoverState.SegmentChange, target.segmentIds, chartEvent);
        }
    }

    return updateFlag;
}

function emitClickEvents
(
    targets: HitTestResult<unknown, IClickableTrait>[],
    chartEvent: IChartPointerEvent<PointerEvent>,
)
    : EEntityUpdateFlag
{
    let updateFlag: EEntityUpdateFlag = EEntityUpdateFlag.NoUpdateRequired;

    for (let i = 0, iEnd = targets.length; i < iEnd; ++i)
    {
        const target = targets[i];

        if (target.entity.onClick != null)
        {
            updateFlag |= target.entity.onClick(chartEvent, target.segmentIds);
        }
    }

    return updateFlag;
}

function emitDblClickEvents
(
    targets: HitTestResult<unknown, IClickableTrait>[],
    chartEvent: IChartPointerEvent<PointerEvent>,
)
    : EEntityUpdateFlag
{
    let updateFlag: EEntityUpdateFlag = EEntityUpdateFlag.NoUpdateRequired;

    for (let i = 0, iEnd = targets.length; i < iEnd; ++i)
    {
        const target = targets[i];

        if (target.entity.onDblClick != null)
        {
            updateFlag |= target.entity.onDblClick(chartEvent, target.segmentIds);
        }
    }

    return updateFlag;
}