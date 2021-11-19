import { _Production, TF32Range2d, TPickPartial, TTypedArray } from "rc-js-util";
import { ICartesian2dPlotRange } from "../../update/update-arg/cartesian2d-plot-range";
import { IGraphAttachPoint, IPlotArea, IPlotConstructionOptions, IPlotRange, IReadonlyPlot, PlotArea } from "@visualization-tools/core";
import { EScreenUnit } from "./e-screen-unit";
import { ICartesian2dGutterOptions } from "./i-cartesian2d-gutter-options";
import { ICartesian2dAxisLabelConfig } from "./cartesian2d-axis-label-config";
import { ICartesian2dTraceOptions } from "./i-cartesian2d-trace-options";
import { T2dUpdateGroup } from "./t2d-update-group";
import { TCartesianUpdateStrategy } from "./t-cartesian-update-strategy";

/**
 * @public
 * Construction options of {@link ICartesian2dPlot}.
 */
export interface ICartesian2dPlotConstructionOptions<TArray extends TTypedArray, TRequiredTraits>
    extends IPlotConstructionOptions<ICartesian2dPlotRange<TArray>, T2dUpdateGroup<TArray, TRequiredTraits>, TRequiredTraits>
{
    gutterOptions: ICartesian2dGutterOptions;
    axisConfig: ICartesian2dAxisLabelConfig;
    traceOptions: ICartesian2dTraceOptions;
    useDefaultAxis: boolean;

    getPlotArea(attachPoint: IGraphAttachPoint): IPlotArea;
}

/**
 * @public
 * {@inheritDoc ICartesian2dPlotConstructionOptions}
 */
export class CartesianPlotConstructionOptions<TArray extends TTypedArray, TRequiredTraits>
    implements ICartesian2dPlotConstructionOptions<TArray, TRequiredTraits>
{
    public updateGroup!: T2dUpdateGroup<TArray, TRequiredTraits>;
    public createUpdateStrategy!: (plot: IReadonlyPlot<IPlotRange, TRequiredTraits>) => TCartesianUpdateStrategy<TArray, TRequiredTraits>;
    public gutterOptions!: ICartesian2dGutterOptions;
    public axisConfig!: ICartesian2dAxisLabelConfig;
    public traceOptions!: ICartesian2dTraceOptions;
    public plotPosition!: TF32Range2d;
    public plotRange!: ICartesian2dPlotRange<TArray>;
    public plotName?: string | undefined;
    public useDefaultAxis: boolean = true;

    public constructor
    (
        options: TPickPartial<ICartesian2dPlotConstructionOptions<TArray, TRequiredTraits>, "useDefaultAxis" | "getPlotArea">,
    )
    {
        Object.assign(this, options);
    }


    public getPlotArea(attachPoint: IGraphAttachPoint): IPlotArea
    {
        const dims = attachPoint.canvasDims;
        const margins = this.gutterOptions.margins.slice();

        switch (this.gutterOptions.unit)
        {
            case EScreenUnit.ActualPixel:
                this.gutterOptions.margins.mat3TransformLength(dims.transforms.pixelToClip, margins);
                break;
            case EScreenUnit.Clip:
                // clip is the required unit, no action needed
                break;
            case EScreenUnit.CssPixel:
                this.gutterOptions.margins.mat3TransformLength(dims.transforms.cssToClip, margins);
                break;
            default:
                _Production.assertValueIsNever(this.gutterOptions.unit);
        }

        return PlotArea.createOneWithMargins(this.plotPosition, margins);
    }

}