import React from "react";
import { _Production } from "rc-js-util";
import { IChartComponentProps } from "./i-chart-component-props";
import { IChartComponent, IChartOptions, TUnknownRenderer } from "@visualization-tools/core";
import { ChartCommandAdapter } from "./commands/chart-command-adapter";
import { OnChartInitializedEvent } from "./events/on-chart-initialized-event";
import { OnChartInitializationErrorEvent } from "./events/on-chart-initialization-error-event";

export function ChartComponent<TOptions extends IChartOptions, TRenderer extends TUnknownRenderer>
(
    props: IChartComponentProps<TOptions, TRenderer>,
)
    : React.ReactElement
{
    const attachPointRef = React.useRef<HTMLDivElement>(null);
    const chartRef = React.useRef<IChartComponent<TRenderer>>();

    React.useEffect(() =>
    {
        if (attachPointRef.current == null)
        {
            throw _Production.createError("failed to get attach point ref");
        }

        const chart = props.options.chartFactory.createOne({
            ...props.options.constructionOptions as TOptions,
            chartContainer: attachPointRef.current,
        });

        if (chart != null)
        {
            if (props.options.transforms != null)
            {
                const transformFactory = chart.getTransformProvider(
                    props.options.transforms.transformsToInitialize,
                    Boolean(props.options.transforms.missIsDebugError),
                );
                props.options.transforms.setTransforms(transformFactory);
            }

            chartRef.current = chart;
            props.options.commandChannel.addListener(new ChartCommandAdapter(chart));

            // the cause of, and solution to all life's problems...
            setTimeout(() => props.onChartEvent(new OnChartInitializedEvent({ chart: chart })));
        }
        else
        {
            // FIXME hard coded (and incorrect) error message
            props.onChartEvent(new OnChartInitializationErrorEvent({ error: "WebGL2 is required" }));
        }
    }, []);

    return (
        <div className="component " ref={attachPointRef}/>
    );
}