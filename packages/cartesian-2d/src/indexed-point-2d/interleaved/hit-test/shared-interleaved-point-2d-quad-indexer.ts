import { IEmscriptenWrapper, IMemoryUtilBindings, IReferenceCountedPtr, ISharedObject, isLittleEndian, Mat3, RawVoidPointer, TProperty, TTypedArray, TTypedArrayCtor } from "rc-js-util";
import { IHitTestableTrait, ISharedEntityQuadTree } from "@visualization-tools/core";
import { TSharedInterleavedPoint2dTrait } from "../../../traits/t-shared-interleaved-point2d-trait";
import { IDrawablePoint2dOffsets } from "../../../series/i-drawable-point2d-offsets";

/**
 * @public
 */
export type TInterleavedPoint2dQuadIndexerBindings<TPrefix extends string> =
    & IMemoryUtilBindings
    & TProperty<`_${"f64" | "f32"}Interleaved2dQuadIndexer_getOffsets`, () => number>
    & TProperty<`_${TPrefix}_index`, (argPtr: number, entityId: number, _filterMask: number) => number>
    ;

/**
 * @public
 * Indexes a {@link @visualization-tools/core#ISharedInterleavedConnector} which describes a collection of 2d points representing a continuous line.
 */
export interface ISharedInterleavedPoint2dQuadIndexer<TArray extends TTypedArray>
    extends ISharedObject
{
    update
    (
        tree: ISharedEntityQuadTree<unknown, IHitTestableTrait>,
        entity: IHitTestableTrait & TSharedInterleavedPoint2dTrait<TArray, IDrawablePoint2dOffsets>,
        worldTransform: Mat3<TArray>,
    )
        : void;
}

/**
 * @public
 * Base 2d point quad indexer.
 */
export class SharedInterleavedPoint2dQuadIndexer<TArray extends TTypedArray, TPrefix extends string>
    implements ISharedInterleavedPoint2dQuadIndexer<TArray>
{
    public static createOne<TCtor extends TTypedArrayCtor, TPrefix extends string>
    (
        wrapper: IEmscriptenWrapper<TInterleavedPoint2dQuadIndexerBindings<TPrefix>>,
        prefix: TPrefix,
        inputType: TCtor,
    )
        : SharedInterleavedPoint2dQuadIndexer<InstanceType<TCtor>, TPrefix>
    {
        const offsetMethodName = inputType.BYTES_PER_ELEMENT === 4
            ? `_f32Interleaved2dQuadIndexer_getOffsets`
            : `_f64Interleaved2dQuadIndexer_getOffsets`;

        return new SharedInterleavedPoint2dQuadIndexer(
            wrapper as IEmscriptenWrapper<TInterleavedPoint2dQuadIndexerBindings<string>>,
            prefix,
            offsetMethodName,
        );
    }

    public sharedObject: IReferenceCountedPtr;

    public update
    (
        tree: ISharedEntityQuadTree<unknown, IHitTestableTrait>,
        entity: IHitTestableTrait & TSharedInterleavedPoint2dTrait<TArray, IDrawablePoint2dOffsets>,
        worldTransform: Mat3<TArray>,
    )
        : void
    {
        const connector = entity.data;
        const dataView = this.rvp.getDataView();
        dataView.setUint32(0, tree.sharedObject.getPtr(), SharedInterleavedPoint2dQuadIndexer.littleEndian);
        dataView.setUint32(this.connectorOffset, connector.sharedObject.getPtr(), SharedInterleavedPoint2dQuadIndexer.littleEndian);
        dataView.setUint16(this.displayConfigOffset, entity.graphicsSettings.pointDisplay.getPixelSize(), SharedInterleavedPoint2dQuadIndexer.littleEndian);

        dataView.setInt8(this.offsetsOffset, connector.offsets.x);
        dataView.setInt8(this.offsetsOffset + 1, connector.offsets.y);
        dataView.setInt8(this.offsetsOffset + 2, connector.offsets.size == null ? -1 : connector.offsets.size);
        dataView.setInt8(this.offsetsOffset + 3, connector.offsets.color == null ? -1 : connector.offsets.color);

        entity.graphicsSettings.pointSizeNormalizer
            .getSizeToPixelTransform()
            .copyToBuffer(dataView, this.sizeTransformOffset);
        worldTransform.copyToBuffer(dataView, this.worldTransformOffset);

        this.wrapper.instance[this.cIndex](this.rvp.sharedObject.getPtr(), entity.hitTestId, entity.groupMask);
    }

    protected constructor
    (
        private readonly wrapper: IEmscriptenWrapper<TInterleavedPoint2dQuadIndexerBindings<string>>,
        prefix: TPrefix,
        offsetMethodName: `_${"f64" | "f32"}Interleaved2dQuadIndexer_getOffsets`,
    )
    {
        this.cIndex = `_${prefix}_index`;
        const offsets = BigInt.asUintN(64, BigInt(this.wrapper.instance[offsetMethodName]()));

        const size = Number(offsets & BigInt(0xFF));
        this.connectorOffset = Number((offsets >> BigInt(8)) & BigInt(0xFF));
        this.displayConfigOffset = Number((offsets >> BigInt(16)) & BigInt(0xFF));
        this.offsetsOffset = Number((offsets >> BigInt(24)) & BigInt(0xFF));
        this.sizeTransformOffset = Number((offsets >> BigInt(32)) & BigInt(0xFF));
        this.worldTransformOffset = Number((offsets >> BigInt(40)) & BigInt(0xFF));

        this.rvp = RawVoidPointer.createOne(wrapper, size, true);
        this.sharedObject = this.rvp.sharedObject;
    }

    private readonly rvp: RawVoidPointer;
    private readonly connectorOffset: number;
    private readonly displayConfigOffset: number;
    private readonly offsetsOffset: number; // ¯\_(ツ)_/¯
    private readonly sizeTransformOffset: number;
    private readonly worldTransformOffset: number;
    private readonly cIndex: `_${TPrefix}_index`;
    private static readonly littleEndian = isLittleEndian;
}
