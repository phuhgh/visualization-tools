import { ICartesian2dPlotRange } from "./cartesian2d-plot-range";
import { Cartesian2dUpdateArg, ICartesian2dUpdateArg } from "./cartesian2d-update-arg";
import { ICartesian2dUpdateArgProvider } from "./i-cartesian2d-update-arg-provider";
import { IReadonlyRange2d, Range2d } from "rc-js-util";
import { ICanvasDimensions, IReadonlyPlot } from "@visualization-tools/core";

/**
 * @public
 * Canvas implementation of {@link ICartesian2dUpdateArgProvider}, inverts the Y direction as canvas expects the origin
 * to be in the top left corner.
 */
export class CanvasCartesian2dUpdateArgProvider<TRequiredTraits>
    implements ICartesian2dUpdateArgProvider<Float64Array, TRequiredTraits>
{
    public getUpdateArg
    (
        plot: IReadonlyPlot<ICartesian2dPlotRange<Float64Array>, unknown>,
        canvasDims: ICanvasDimensions,
    )
        : ICartesian2dUpdateArg<Float64Array>
    {
        CanvasCartesian2dUpdateArgProvider.copyReverseY(this.reverseWholeRange, plot.plotDimensionsOTL.pixelArea.wholeRange);
        CanvasCartesian2dUpdateArgProvider.copyReverseY(this.reverseInteractiveRange, plot.plotDimensionsOTL.pixelArea.interactiveRange);

        this.updateArg.drawTransforms.update(
            plot.plotRange.dataRange,
            this.reverseWholeRange,
            this.reverseInteractiveRange,
        );
        this.updateArg.update(plot, canvasDims);

        return this.updateArg;
    }

    private static copyReverseY(to: Range2d<Float32Array>, from: IReadonlyRange2d<Float32Array>): void
    {
        to[0] = from[0];
        to[1] = from[1];
        to[2] = from[3];
        to[3] = from[2];
    }

    private reverseWholeRange = new Range2d.f32();
    private reverseInteractiveRange = new Range2d.f32();
    private updateArg = new Cartesian2dUpdateArg(Float64Array);
}
