import { RgbaColorPacker, TTypedArray, Vec2 } from "rc-js-util";
import { IDrawablePoint2dOffsets } from "./i-drawable-point2d-offsets";
import { ICartesian2dUpdateArg } from "../update/cartesian2d-update-arg";
import { TInterleavedPoint2dTrait } from "../traits/t-interleaved-point2d-trait";
import { ICanvasEntityRenderer, IGraphicsComponentSpecification, IIndexedDataConnector } from "@visualization-tools/core";

// todo jack: add highlighting
/**
 * @public
 * Draws lines with or without segments of different colors and sizes.
 */
export class CanvasLineGraphicsComponent
    implements IGraphicsComponentSpecification<ICanvasEntityRenderer, ICartesian2dUpdateArg<TTypedArray>, TInterleavedPoint2dTrait<TTypedArray>>
{
    public specification = {};

    public getCacheId(): string
    {
        return "CanvasLine";
    }

    public initialize(): void
    {
        // no action needed
    }

    public onBeforeUpdate(): void
    {
        // no action needed
    }

    public update
    (
        entity: TInterleavedPoint2dTrait<TTypedArray>,
        renderer: ICanvasEntityRenderer,
        updateArg: ICartesian2dUpdateArg<TTypedArray>,
    )
        : void
    {
        if (entity.data.getLength() < 2)
        {
            return;
        }

        renderer.context.save();

        if (entity.data.getLength() < 3 || entity.data.offsets.size == null)
        {
            CanvasLineGraphicsComponent.drawConstantSizeLine(entity, renderer.context, updateArg);
        }
        else
        {
            CanvasLineGraphicsComponent.drawLineWithPointSize(entity, renderer.context, updateArg, entity.data.offsets.size);
        }

        renderer.context.restore();
    }

    /**#
     * Only works with 3 points or more.
     */
    private static drawLineWithPointSize<TArray extends TTypedArray>
    (
        entity: TInterleavedPoint2dTrait<TTypedArray>,
        context: CanvasRenderingContext2D,
        updateArg: ICartesian2dUpdateArg<TArray>,
        sizeOffset: number,
    )
        : void
    {
        context.fillStyle = RgbaColorPacker.makeDomColorString(
            entity.graphicsSettings.pointDisplay
                .getColor()
                .getPackedRGBAColor(true),
        );

        const connector = entity.data;
        const xOffset = connector.offsets.x;
        const yOffset = connector.offsets.y;
        const colorOffset = connector.offsets.color;
        const dataWorld = updateArg.drawTransforms.dataToInteractiveArea;
        const sizeTransform = entity.graphicsSettings.pointSizeNormalizer.getSizeToPixelTransform();
        const start = connector.getStart();

        const getPoint = (index: number): Vec2<TArray> =>
        {
            return Vec2.f64.factory.createOne(
                dataWorld.getVec3MultiplyX(connector.getValue(index, xOffset)),
                dataWorld.getVec3MultiplyY(connector.getValue(index, yOffset)),
            ) as Vec2<TArray>;
        };

        let p1 = getPoint(start);
        const p1size = sizeTransform.getVec2MultiplyX(connector.getValue(start, sizeOffset)) * 0.5;
        let p2 = getPoint(start + 1);
        let p2size = sizeTransform.getVec2MultiplyX(connector.getValue(start + 1, sizeOffset)) * 0.5;
        let p3 = getPoint(start + 2);

        let l1Normal = CanvasLineGraphicsComponent.getLineNormal(p1, p2, Vec2.f64.factory.createOneEmpty() as Vec2<TArray>);
        let l2Normal = CanvasLineGraphicsComponent.getLineNormal(p2, p3, Vec2.f64.factory.createOneEmpty() as Vec2<TArray>);
        const cap = CanvasLineGraphicsComponent.normalOfAddition(l1Normal, l2Normal, Vec2.f64.factory.createOneEmpty() as Vec2<TArray>);

        context.beginPath();
        CanvasLineGraphicsComponent.moveTo(context, p1, l1Normal, -p1size);
        CanvasLineGraphicsComponent.lineTo(context, p1, l1Normal, p1size);

        for (let i = start + 2, iEnd = connector.getEnd() - 1; i < iEnd; ++i)
        {
            CanvasLineGraphicsComponent.lineTo(context, p2, cap, p2size);
            CanvasLineGraphicsComponent.lineTo(context, p2, cap, -p2size);
            CanvasLineGraphicsComponent.closeSegment(connector, context, colorOffset, i);
            CanvasLineGraphicsComponent.moveTo(context, p2, cap, -p2size);
            CanvasLineGraphicsComponent.lineTo(context, p2, cap, p2size);

            const pointTmp = p1;
            p1 = p2;
            p2 = p3;
            p2size = sizeTransform.getVec2MultiplyX(connector.getValue(i, sizeOffset)) * 0.5;
            const lineTmp = l1Normal;
            l1Normal = l2Normal;
            pointTmp[0] = dataWorld.getVec3MultiplyX(connector.getValue(i + 1, xOffset));
            pointTmp[1] = dataWorld.getVec3MultiplyY(connector.getValue(i + 1, yOffset));
            p3 = pointTmp;
            l2Normal = CanvasLineGraphicsComponent.getLineNormal(p2, p3, lineTmp);
            CanvasLineGraphicsComponent.normalOfAddition(l1Normal, l2Normal, cap);
        }

        CanvasLineGraphicsComponent.lineTo(context, p2, cap, p2size);
        CanvasLineGraphicsComponent.lineTo(context, p2, cap, -p2size);
        CanvasLineGraphicsComponent.closeSegment(connector, context, colorOffset, connector.getEnd() - 2);

        const last = connector.getEnd() - 1;
        p3 = getPoint(last);
        const p3size = sizeTransform.getVec2MultiplyX(connector.getValue(last, sizeOffset)) * 0.5;
        l2Normal = CanvasLineGraphicsComponent.getLineNormal(p2, p3, l2Normal);

        CanvasLineGraphicsComponent.moveTo(context, p2, cap, p2size);
        CanvasLineGraphicsComponent.lineTo(context, p2, cap, -p2size);
        CanvasLineGraphicsComponent.lineTo(context, p3, l2Normal, -p3size);
        CanvasLineGraphicsComponent.lineTo(context, p3, l2Normal, p3size);
        CanvasLineGraphicsComponent.closeSegment(connector, context, colorOffset, connector.getEnd() - 1);

        if (colorOffset == null)
        {
            context.fillStyle = RgbaColorPacker.makeDomColorString(entity.graphicsSettings.pointDisplay.getColor().getPackedRGBAColor());
            context.fill();
        }
    }

    private static closeSegment
    (
        connector: IIndexedDataConnector<IDrawablePoint2dOffsets>,
        context: CanvasRenderingContext2D,
        colorOffset: number | undefined,
        index: number,
    )
        : void
    {
        context.closePath();

        if (colorOffset != null)
        {
            context.fillStyle = RgbaColorPacker.makeDomColorString(connector.getValue(index, colorOffset));
            context.fill();
            context.beginPath();
        }
    }

    private static normalOfAddition<TArray extends TTypedArray>
    (
        a: Vec2<TArray>,
        b: Vec2<TArray>,
        result: Vec2<TArray>,
    )
        : Vec2<TArray>
    {
        return a
            .add(b, CanvasLineGraphicsComponent.tmp)
            .normalize(result);
    }

    private static getLineNormal<TArray extends TTypedArray>
    (
        p1: Vec2<TArray>,
        p2: Vec2<TArray>,
        result: Vec2<TArray>,
    )
        : Vec2<TArray>
    {
        return p2
            .subtract(p1, CanvasLineGraphicsComponent.tmp)
            .normalize(CanvasLineGraphicsComponent.tmp)
            .getNormal(result);
    }

    private static moveTo<TArray extends TTypedArray>
    (
        context: CanvasRenderingContext2D,
        vec: Vec2<TArray>,
        offset: Vec2<TArray>,
        scaleFactor: number,
    )
        : void
    {
        offset.scalarMultiply(scaleFactor, CanvasLineGraphicsComponent.tmp);
        vec.add(CanvasLineGraphicsComponent.tmp, CanvasLineGraphicsComponent.tmp);
        context.moveTo(CanvasLineGraphicsComponent.tmp.getX(), CanvasLineGraphicsComponent.tmp.getY());
    }

    private static lineTo<TArray extends TTypedArray>
    (
        context: CanvasRenderingContext2D,
        vec: Vec2<TArray>,
        offset: Vec2<TArray>,
        scaleFactor: number,
    )
    {
        offset.scalarMultiply(scaleFactor, CanvasLineGraphicsComponent.tmp);
        vec.add(CanvasLineGraphicsComponent.tmp, CanvasLineGraphicsComponent.tmp);
        context.lineTo(CanvasLineGraphicsComponent.tmp.getX(), CanvasLineGraphicsComponent.tmp.getY());
    }

    private static tmp = new Vec2.f64();

    private static drawConstantSizeLine
    (
        entity: TInterleavedPoint2dTrait<TTypedArray>,
        context: CanvasRenderingContext2D,
        updateArg: ICartesian2dUpdateArg<TTypedArray>,
    )
        : void
    {
        const getLineColorFromData = CanvasLineGraphicsComponent.getLineColorFromData;
        const connector = entity.data;
        const xOffset = connector.offsets.x;
        const yOffset = connector.offsets.y;
        const colorOffset = connector.offsets.color;
        const dataWorld = updateArg.drawTransforms.dataToInteractiveArea;
        const startIndex = connector.getStart();
        let xCanvas = dataWorld.getVec3MultiplyX(connector.getValue(startIndex, xOffset));
        let yCanvas = dataWorld.getVec3MultiplyY(connector.getValue(startIndex, yOffset));

        const defaultColor = RgbaColorPacker.makeDomColorString(entity.graphicsSettings.pointDisplay
            .getColor()
            .getPackedRGBAColor(true));

        if (colorOffset == null)
        {
            context.strokeStyle = defaultColor;
        }

        context.beginPath();
        context.moveTo(xCanvas, yCanvas);

        for (let i = startIndex + 1, iEnd = connector.getEnd(); i < iEnd; ++i)
        {
            xCanvas = dataWorld.getVec3MultiplyX(connector.getValue(i, xOffset));
            yCanvas = dataWorld.getVec3MultiplyY(connector.getValue(i, yOffset));

            if (colorOffset != null)
            {
                context.strokeStyle = getLineColorFromData(connector, i, colorOffset);
                context.lineTo(xCanvas, yCanvas);
                context.stroke();
                context.beginPath();
                context.moveTo(xCanvas, yCanvas);
            }
            else
            {
                context.lineTo(xCanvas, yCanvas);
            }
        }

        if (colorOffset != null)
        {
            context.stroke();
        }
    }

    private static getLineColorFromData(this: void, connector: IIndexedDataConnector<IDrawablePoint2dOffsets>, index: number, offset: number): string
    {
        return RgbaColorPacker.makeDomColorString(connector.getValue(index, offset));
    }
}