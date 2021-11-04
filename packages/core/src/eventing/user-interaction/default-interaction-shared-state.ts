import { IInteractionSharedState } from "./i-interaction-shared-state";
import { IDefaultTargets } from "./i-default-targets";
import { IChartPointerEvent } from "./internal-events/chart-pointer-event";
import { _Array, _Map, _Set } from "rc-js-util";
import { HitTestResult } from "../hit-testing/hit-test-result";
import { IPlotInteractionProviders } from "./plot-interaction-providers";
import { IClickableTrait } from "../../entities/traits/i-clickable-trait";
import { TEntityTrait } from "../../entities/traits/t-entity-trait";
import { EHoverState, IHoverableTrait } from "../../entities/traits/i-hoverable-trait";
import { IHitTestableTrait } from "../../entities/groups/i-hit-testable-trait";
import { EEntityUpdateFlag } from "../../update/e-entity-update-flag";
import { OnHoverResult } from "./on-hover-result";

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

        const newlyHovered = _Map.setDifference(hoverTargetsByEntity, this.hoveredEntities);
        const noLongerHovered = _Map.setDifference(this.hoveredEntities, hoverTargetsByEntity);
        const stillHovered = _Map.intersect(hoverTargetsByEntity, this.hoveredEntities);
        const stillHoveredArray = _Map.valuesToArray(stillHovered);
        const newlyHoveredArray = _Map.valuesToArray(newlyHovered);
        const noLongerHoveredArray = _Map.valuesToArray(noLongerHovered);
        const segmentChanged = getSegmentChangedEntities(stillHovered, this.hoveredEntities);
        const segmentChangedArray = _Map.valuesToArray(segmentChanged);
        const unchanged = _Map.setDifference(stillHovered, segmentChanged);
        const unchangedArray = _Map.valuesToArray(unchanged);

        let updateFlag = emitHoverLeftEvents(chartEvent, noLongerHoveredArray);
        updateFlag |= emitSegmentChangeEvents(chartEvent, unchangedArray, EHoverState.Unchanged);
        updateFlag |= emitHoverEnterEvents(chartEvent, newlyHoveredArray);
        updateFlag |= emitSegmentChangeEvents(chartEvent, segmentChangedArray, EHoverState.SegmentChange);

        this.hoveredEntities = hoverTargetsByEntity;

        if (newlyHoveredArray.length > 0 || segmentChangedArray.length > 0 || noLongerHoveredArray.length > 0)
        {
            const result = new OnHoverResult(newlyHoveredArray, stillHoveredArray, noLongerHoveredArray, unchangedArray);
            this.providers.callbacks.onHover(result, chartEvent);
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

function getSegmentChangedEntities
(
    stillHovered: Map<TEntityTrait<unknown, IHitTestableTrait>, HitTestResult<unknown, IHitTestableTrait>>,
    previouslyHovered: Map<TEntityTrait<unknown, IHitTestableTrait>, HitTestResult<unknown, IHitTestableTrait>>,
)
    : Map<TEntityTrait<unknown, IHitTestableTrait>, HitTestResult<unknown, IHitTestableTrait>>
{
    const segmentChanged = new Map<TEntityTrait<unknown, IHitTestableTrait>, HitTestResult<unknown, IHitTestableTrait>>();

    // from those that were previously hovered, remove those where the segment hasn't changed
    stillHovered.forEach((target, key) =>
    {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const newTarget = previouslyHovered.get(key)!;

        if (!_Set.isSetEqual(newTarget.segmentIds, target.segmentIds))
        {
            segmentChanged.set(key, target);
        }
    });

    return segmentChanged;
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

        if (target.entity.onHover != null)
        {
            updateFlag |= target.entity.onHover(EHoverState.Left, target.segmentIds, chartEvent);
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

        if (target.entity.onHover != null)
        {
            updateFlag |= target.entity.onHover(EHoverState.Entered, target.segmentIds, chartEvent);
        }
    }

    return updateFlag;
}

function emitSegmentChangeEvents
(
    chartEvent: IChartPointerEvent<PointerEvent>,
    targets: HitTestResult<unknown, IHoverableTrait>[],
    state: EHoverState.SegmentChange | EHoverState.Unchanged,
)
    : EEntityUpdateFlag
{
    let updateFlag: EEntityUpdateFlag = EEntityUpdateFlag.NoUpdateRequired;

    for (let i = 0, iEnd = targets.length; i < iEnd; ++i)
    {
        const target = targets[i];

        if (target.entity.onHover != null)
        {
            updateFlag |= target.entity.onHover(state, target.segmentIds, chartEvent);
        }
    }

    if (state === EHoverState.Unchanged)
    {
        return EEntityUpdateFlag.NoUpdateRequired;
    }
    else
    {
        return updateFlag;
    }
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