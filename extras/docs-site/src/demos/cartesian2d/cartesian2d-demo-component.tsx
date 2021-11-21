import React, { useEffect, useState } from "react";
import { _Array, _Production } from "rc-js-util";
import { TChartEvents } from "../../chart/events/t-chart-events";
import { EChartEvent } from "../../chart/events/e-chart-event";
import { showSidePanel } from "../show-side-panel";
import { ChartComponent } from "../../chart/chart-component";
import { Cartesian2dPlotControlsComponent } from "./cartesian-2d-plot-controls-component";
import DemoCard from "../demo-card";
import { MaximizeDemoEvent } from "../events/maximize-demo-event";
import { IDemoProps } from "../i-demo-props";
import { TDemoEvents } from "../events/t-demo-events";
import { EDemoEvent } from "../events/e-demo-event";
import { ResizeChartCommand } from "../../chart/commands/resize-chart-command";
import { IChartEntity, TUnknownRenderer } from "@visualization-tools/core";
import { PlotDemoCommandAdapter } from "./plot-demo-command-adapter";
import { UpdateOnNextFrameCommand } from "../../chart/commands/update-on-next-frame-command";
import { PlotCommandAdapter } from "../../cartesian2d-plot/commands/plot-command-adapter";

export function Cartesian2dDemoComponent<TRenderer extends TUnknownRenderer
    , TArrayCtor extends Float32ArrayConstructor | Float64ArrayConstructor
    , TTraits extends IChartEntity<unknown>>
(
    props: IDemoProps<TRenderer, TArrayCtor, TTraits>,
)
    : React.ReactElement
{
    const [sidePanelOpen, setSidePanelOpen] = useState(false);
    const [plotComponentOptions, setPlotOptions] = useState(props.plotOptions);
    const updateOptions = (): void => setPlotOptions({ ...plotComponentOptions });
    const dataEntities = props.entityOptions.entities;
    const selection = props.entityOptions.selectedEntities;

    useEffect(() =>
    {
        props.demoOptions.commandChannel.addListener(new PlotDemoCommandAdapter(props.chartOptions.commandChannel));
    }, []);

    const chartDemoComponent = showSidePanel(
        <ChartComponent options={props.chartOptions} onChartEvent={($event) => onChartEvent($event, props)}/>,
        <Cartesian2dPlotControlsComponent plotOptions={props.plotOptions}
                                          entities={dataEntities}
                                          selection={selection}
                                          emitEvent={($event) => onDemoEvent($event, props, setSidePanelOpen, updateOptions)}/>,
        sidePanelOpen,
    );

    return (
        <DemoCard title={props.demoOptions.title}
                  subHeading={props.demoOptions.subtitle}
                  chartComponent={chartDemoComponent}
                  onExpandClick={() => onDemoEvent(new MaximizeDemoEvent(), props, setSidePanelOpen, updateOptions)}/>
    );
}

function onChartEvent<TRenderer extends TUnknownRenderer
    , TArrayCtor extends Float32ArrayConstructor | Float64ArrayConstructor
    , TTraits extends IChartEntity<unknown>>
(
    $event: TChartEvents<TRenderer>,
    props: IDemoProps<TRenderer, TArrayCtor, TTraits>,
)
    : void
{
    switch ($event.id)
    {
        case EChartEvent.OnChartInitialized:
        {
            const chart = $event.arg.chart;
            const plot = chart.addPlot(props.plotOptions.plotFactory.createOne(chart, props.plotOptions.options));
            props.plotOptions.commandChannel.addListener(new PlotCommandAdapter(
                plot,
                props.chartOptions.commandChannel,
                props.plotOptions.commandHandlers,
            ));
            props.plotOptions.onPlotCreated(plot, chart);

            chart.updateOnNextFrame();
            break;
        }
        case EChartEvent.OnChartInitializationError:
        {
            // FIXME
            break;
        }
        default:
        {
            _Production.assertValueIsNever($event);
            break;
        }
    }
}

function onDemoEvent<TRenderer extends TUnknownRenderer
    , TArrayCtor extends Float32ArrayConstructor | Float64ArrayConstructor
    , TTraits extends IChartEntity<unknown>>
(
    $event: TDemoEvents<TTraits>,
    props: IDemoProps<TRenderer, TArrayCtor, TTraits>,
    setSidePanelOpen: React.Dispatch<React.SetStateAction<boolean>>,
    updateOptions: () => void,
)
    : void
{
    props.onDemoEvent($event);

    switch ($event.id)
    {
        case EDemoEvent.MaximizeDemo:
        {
            setSidePanelOpen(true);
            props.chartOptions.commandChannel.emit(new ResizeChartCommand());
            break;
        }
        case EDemoEvent.MinimizeDemo:
        {
            setSidePanelOpen(false);
            props.chartOptions.commandChannel.emit(new ResizeChartCommand());
            break;
        }
        case EDemoEvent.ProxyPlotCommand:
        {
            props.plotOptions.commandChannel.emit($event.arg);
            break;
        }
        case EDemoEvent.ResetDemo:
        {
            const initialTransform = props.plotOptions.initialTransform;
            props.plotOptions.options.plotRange.updateDataRange(props.plotOptions.initialRange.slice());
            props.plotOptions.options.plotRange.userTransform.updateTransform(initialTransform[0], initialTransform[1]);
            updateOptions();
            props.chartOptions.commandChannel.emit(new UpdateOnNextFrameCommand({}));
            break;
        }
        case EDemoEvent.EntitySelectionChanged:
        {
            _Array.forEach($event.arg.addedEntities, entity => entity.isFiltered = false);
            _Array.forEach($event.arg.removedEntities, entity => entity.isFiltered = true);
            break;
        }
        default:
        {
            _Production.assertValueIsNever($event);
            break;
        }
    }
}