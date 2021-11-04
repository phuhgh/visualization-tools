import { IReadonlyRange2d, Mat3, Range2d, TTypedArray, TTypedArrayCtor } from "rc-js-util";

/**
 * @public
 * Provides data transforms useful for drawing and interaction handling. Created by {@link ICartesian2dUpdateArgProvider}.
 */
export interface ICartesian2dTransforms<TArray extends TTypedArray>
{
    readonly dataToPlotArea: Mat3<TArray>;
    readonly dataToInteractiveArea: Mat3<TArray>;
    readonly dataToPlotSize: Mat3<TArray>;
    readonly dataToInteractiveSize: Mat3<TArray>;

    update
    (
        dataRange: IReadonlyRange2d<TArray>,
        plotArea: IReadonlyRange2d<TTypedArray>,
        interactionArea: IReadonlyRange2d<TTypedArray>,
    )
        : void;
}

/**
 * @public
 * {@inheritDoc ICartesian2dTransforms}
 */
export class Cartesian2dTransforms<TCtor extends TTypedArrayCtor> implements ICartesian2dTransforms<InstanceType<TCtor>>
{
    public readonly dataToPlotArea: Mat3<InstanceType<TCtor>>;
    public readonly dataToInteractiveArea: Mat3<InstanceType<TCtor>>;
    public readonly dataToPlotSize: Mat3<InstanceType<TCtor>>;
    public readonly dataToInteractiveSize: Mat3<InstanceType<TCtor>>;

    public constructor
    (
        ctor: TCtor,
    )
    {
        const Mat3Ctor = Mat3.getCtor(ctor);
        this.dataToPlotArea = new Mat3Ctor();
        this.dataToInteractiveArea = new Mat3Ctor();
        this.dataToPlotSize = new Mat3Ctor();
        this.dataToInteractiveSize = new Mat3Ctor();
        this.tmp = Range2d.getCtor(ctor).factory.createOneEmpty();
    }

    public update
    (
        dataRange: IReadonlyRange2d<InstanceType<TCtor>>,
        plotArea: IReadonlyRange2d<TTypedArray>,
        interactionArea: IReadonlyRange2d<TTypedArray>,
    )
        : void
    {
        dataRange.getRangeTransform(plotArea, this.dataToPlotArea);
        dataRange.getRangeTransform(interactionArea, this.dataToInteractiveArea);

        const tmp = this.tmp;
        tmp.setXMax(plotArea.getXRange());
        tmp.setYMax(plotArea.getYRange());
        dataRange.getRangeTransform(tmp, this.dataToPlotSize);
        tmp.setXMax(interactionArea.getXRange());
        tmp.setYMax(interactionArea.getYRange());
        dataRange.getRangeTransform(tmp, this.dataToInteractiveSize);
    }

    private readonly tmp: Range2d<InstanceType<TCtor>>;
}