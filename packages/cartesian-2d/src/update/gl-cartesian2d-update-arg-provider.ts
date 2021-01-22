import { ICartesian2dPlotRange } from "./cartesian2d-plot-range";
import { Cartesian2dUpdateArg, ICartesian2dUpdateArg } from "./cartesian2d-update-arg";
import { ICartesian2dUpdateArgProvider } from "./i-cartesian2d-update-arg-provider";
import { ICanvasDimensions, IReadonlyPlot } from "@visualization-tools/core";

/**
 * @public
 * WebGL implementation of {@link ICartesian2dUpdateArgProvider}.
 */
export class GlCartesian2dUpdateArgProvider<TRequiredTraits>
    implements ICartesian2dUpdateArgProvider<Float32Array, TRequiredTraits>
{
    public getUpdateArg
    (
        plot: IReadonlyPlot<ICartesian2dPlotRange<Float32Array>, unknown>,
        canvasDims: ICanvasDimensions,
    )
        : ICartesian2dUpdateArg<Float32Array>
    {
        this.updateArg.drawTransforms.update(
            plot.plotRange.dataRange,
            plot.plotDimensionsOBL.clipSpaceArea.wholeRange,
            plot.plotDimensionsOBL.clipSpaceArea.interactiveRange,
        );
        this.updateArg.update(plot, canvasDims);

        return this.updateArg;
    }

    private updateArg = new Cartesian2dUpdateArg(Float32Array);
}
