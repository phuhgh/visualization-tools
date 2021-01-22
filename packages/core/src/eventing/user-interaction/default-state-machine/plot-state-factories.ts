import { DraggingState } from "./dragging-state";
import { IdleState } from "./idle-state";
import { IndeterminateState } from "./indeterminate-state";
import { PanningState } from "./panning-state";
import { PinchZoomingState } from "./pinch-zooming-state";
import { IInteractionOptions } from "../i-interaction-options";
import { IPointerEventTimestamp } from "../internal-events/i-pointer-event-timestamp";
import { IChartState } from "./i-chart-state";
import { IChartPointerEvent } from "../internal-events/chart-pointer-event";
import { IPlotInteractionProviders } from "../plot-interaction-providers";
import { IDefaultTargets } from "../hit-test/i-default-targets";
import { IInteractionSharedState } from "../i-interaction-shared-state";

/**
 * @public
 * State providers for user interaction state machine.
 */
export interface IPlotStateFactories<TPlotRange>
{
    getDraggingState
    (
        startEvent: IChartPointerEvent<PointerEvent>,
        options: IInteractionOptions,
        providers: IPlotInteractionProviders<TPlotRange, IDefaultTargets>,
        sharedState: IInteractionSharedState,
    )
        : IChartState<TPlotRange>;

    getIdleState
    (
        lastClick: IPointerEventTimestamp | null,
        options: IInteractionOptions,
        providers: IPlotInteractionProviders<TPlotRange, IDefaultTargets>,
        sharedState: IInteractionSharedState,
    )
        : IChartState<TPlotRange>;

    getIndeterminateState
    (
        downEvent: IChartPointerEvent<PointerEvent>,
        options: IInteractionOptions,
        providers: IPlotInteractionProviders<TPlotRange, IDefaultTargets>,
        sharedState: IInteractionSharedState,
        lastClick: IPointerEventTimestamp | null,
    )
        : IChartState<TPlotRange>;

    getPanningState
    (
        startEvent: IChartPointerEvent<PointerEvent>,
        options: IInteractionOptions,
        providers: IPlotInteractionProviders<TPlotRange, IDefaultTargets>,
        sharedState: IInteractionSharedState,
    )
        : IChartState<TPlotRange>;

    getPinchZoomingState
    (
        firstDownFingerEvent: IChartPointerEvent<PointerEvent>,
        secondDownFingerEvent: IChartPointerEvent<PointerEvent>,
        options: IInteractionOptions,
        providers: IPlotInteractionProviders<TPlotRange, IDefaultTargets>,
        sharedState: IInteractionSharedState,
    )
        : IChartState<TPlotRange>;
}

/**
 * @public
 * {@inheritDoc IPlotStateFactories}
 */
export class PlotStateFactories<TPlotRange> implements IPlotStateFactories<TPlotRange>
{
    public getDraggingState
    (
        startEvent: IChartPointerEvent<PointerEvent>,
        options: IInteractionOptions,
        providers: IPlotInteractionProviders<TPlotRange, IDefaultTargets>,
        sharedState: IInteractionSharedState,
    )
        : IChartState<TPlotRange>
    {
        return new DraggingState(startEvent.clone(), options, providers, sharedState);
    }

    public getIdleState
    (
        lastClick: IPointerEventTimestamp | null,
        options: IInteractionOptions,
        providers: IPlotInteractionProviders<TPlotRange, IDefaultTargets>,
        sharedState: IInteractionSharedState,
    )
        : IChartState<TPlotRange>
    {
        return new IdleState(lastClick, options, providers, sharedState);
    }

    public getIndeterminateState
    (
        downEvent: IChartPointerEvent<PointerEvent>,
        options: IInteractionOptions,
        providers: IPlotInteractionProviders<TPlotRange, IDefaultTargets>,
        sharedState: IInteractionSharedState,
        lastClick: IPointerEventTimestamp | null,
    )
        : IChartState<TPlotRange>
    {
        return new IndeterminateState(downEvent.clone(), options, providers, sharedState, lastClick);
    }

    public getPanningState
    (
        startEvent: IChartPointerEvent<PointerEvent>,
        options: IInteractionOptions,
        providers: IPlotInteractionProviders<TPlotRange, IDefaultTargets>,
        sharedState: IInteractionSharedState,
    )
        : IChartState<TPlotRange>
    {
        return new PanningState(startEvent.clone(), options, providers, sharedState);
    }

    public getPinchZoomingState
    (
        firstDownFingerEvent: IChartPointerEvent<PointerEvent>,
        secondDownFingerEvent: IChartPointerEvent<PointerEvent>,
        options: IInteractionOptions,
        providers: IPlotInteractionProviders<TPlotRange, IDefaultTargets>,
        sharedState: IInteractionSharedState,
    )
        : IChartState<TPlotRange>
    {
        return new PinchZoomingState(firstDownFingerEvent.clone(), secondDownFingerEvent.clone(), options, providers, sharedState);
    }
}