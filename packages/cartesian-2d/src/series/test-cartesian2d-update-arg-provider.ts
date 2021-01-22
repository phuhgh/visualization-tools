import { CanvasDimensions, ICanvasDimensions, PlotArea, PlotDimensions } from "@visualization-tools/core";
import { Range2d, TF32Vec2, TTypedArrayCtor } from "rc-js-util";
import { Cartesian2dUpdateArg, ICartesian2dUpdateArg } from "../update/cartesian2d-update-arg";

/**
 * @internal
 * Assumes a data range of 0-4 in both axis.
 */
export class TestCartesian2dUpdateArgProvider<TCtor extends TTypedArrayCtor>
{
    public constructor
    (
        private readonly ctor: TCtor,
        private readonly dims: TF32Vec2,
        dpr: number = 1,
    )
    {
        const cssRange = Range2d.f32.factory.createOne(0, this.dims.getX(), 0, this.dims.getY());
        const pixelRange = Range2d.f32.factory.createOne(0, this.dims.getX() * dpr, 0, this.dims.getY() * dpr);
        this.canvasDims = new CanvasDimensions(dpr, cssRange, pixelRange, new Range2d.f32());
    }

    public createTestCartesian2dUpdateArg(): ICartesian2dUpdateArg<InstanceType<TCtor>>
    {
        const arg = new Cartesian2dUpdateArg(this.ctor);
        (arg.plotRange as Range2d<InstanceType<TCtor>>).update(0, 4, 0, 4);
        arg.canvasDimensions = this.canvasDims;
        const plotArea = PlotArea.createDefault();
        arg.plotDimensionsOBL = PlotDimensions.createOneOBL(plotArea, this.canvasDims);
        arg.plotDimensionsOTL = PlotDimensions.createOneOTL(plotArea, this.canvasDims);
        arg.interactionTransforms.update(
            arg.plotRange,
            arg.plotDimensionsOBL.cssArea.wholeRange,
            arg.plotDimensionsOBL.cssArea.interactiveRange,
        );
        arg.drawTransforms.update(
            arg.plotRange,
            arg.plotDimensionsOBL.clipSpaceArea.wholeRange,
            arg.plotDimensionsOBL.clipSpaceArea.interactiveRange,
        );

        return arg;
    }

    private readonly canvasDims: ICanvasDimensions;
}