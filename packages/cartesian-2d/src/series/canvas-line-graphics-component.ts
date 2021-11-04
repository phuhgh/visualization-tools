import { RgbaColorPacker, TF64Vec4, TTypedArray, Vec4 } from "rc-js-util";
import { ICartesian2dUpdateArg } from "../update/update-arg/cartesian2d-update-arg";
import { TInterleavedPoint2dTrait } from "../traits/t-interleaved-point2d-trait";
import { EGraphicsComponentType, ICanvasComponentRenderer, IGraphicsComponent, NoTransformProvider } from "@visualization-tools/core";
import { Indexed2dCappedLineValueProvider } from "./indexed2d-capped-line-value-provider";
import { CanvasVariableWidthCappedLine } from "./canvas-variable-width-capped-line";

// FIXME: this needs unit tests
/**
 * @public
 * Draws lines with or without segments of different colors and sizes.
 */
export class CanvasLineGraphicsComponent
    implements IGraphicsComponent<ICanvasComponentRenderer, ICartesian2dUpdateArg<TTypedArray>, TInterleavedPoint2dTrait<TTypedArray>>
{
    public readonly type = EGraphicsComponentType.Entity;
    public specification = {};
    public transform = new NoTransformProvider();

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
        renderer: ICanvasComponentRenderer,
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
            this.drawLineWithPointSize(entity, renderer.context, updateArg, entity.data.offsets.size);
        }

        renderer.context.restore();
    }

    /**#
     * Only works with 3 points or more.
     */
    private drawLineWithPointSize<TArray extends TTypedArray>
    (
        entity: TInterleavedPoint2dTrait<TTypedArray>,
        context: CanvasRenderingContext2D,
        updateArg: ICartesian2dUpdateArg<TArray>,
        sizeOffset: number,
    )
        : void
    {
        const connector = entity.data;
        const xOffset = connector.offsets.x;
        const yOffset = connector.offsets.y;
        const userTransform = updateArg.userTransform;
        const sizeTransform = entity.graphicsSettings.pointSizeNormalizer.getSizeToPixelTransform();

        const cappedLine = this.cappedLine;
        this.pointProvider.update(entity, 0);
        this.valueProvider.update(entity, updateArg.drawTransforms.dataToInteractiveArea, sizeTransform, userTransform);
        cappedLine.beginLine(context, this.pointProvider.p1, this.pointProvider.p2);

        for (let i = connector.getStart() + 2, iEnd = connector.getEnd() - 1; i < iEnd; ++i)
        {
            cappedLine.setMidPoint(
                context,
                connector.getValue(i, xOffset),
                connector.getValue(i, yOffset),
                connector.getValue(i, sizeOffset),
                getColor(entity, i),
            );
        }

        const last = connector.getEnd() - 1;
        cappedLine.endLine(
            context,
            connector.getValue(last, xOffset),
            connector.getValue(last, yOffset),
            connector.getValue(last, sizeOffset),
            getColor(entity, last),
        );
    }

    private static drawConstantSizeLine
    (
        entity: TInterleavedPoint2dTrait<TTypedArray>,
        context: CanvasRenderingContext2D,
        updateArg: ICartesian2dUpdateArg<TTypedArray>,
    )
        : void
    {
        const connector = entity.data;
        const xOffset = connector.offsets.x;
        const yOffset = connector.offsets.y;
        const colorOffset = connector.offsets.color;
        const screenTransform = updateArg.drawTransforms.dataToInteractiveArea;
        const userTransform = updateArg.userTransform;
        const startIndex = connector.getStart();
        let xCanvas = screenTransform.getVec3MultiplyX(userTransform.forwardX(connector.getValue(startIndex, xOffset)));
        let yCanvas = screenTransform.getVec3MultiplyY(userTransform.forwardY(connector.getValue(startIndex, yOffset)));
        const defaultColor = RgbaColorPacker.makeDomColorString(entity.graphicsSettings.pointDisplay.packedColor);
        const highlightColor = RgbaColorPacker.makeDomColorString(entity.graphicsSettings.pointDisplay.packedHighlightColor);

        if (colorOffset == null)
        {
            context.strokeStyle = defaultColor;
        }

        context.lineWidth = entity.graphicsSettings.pointDisplay.getPixelSize();
        context.beginPath();
        context.moveTo(xCanvas, yCanvas);

        for (let i = startIndex + 1, iEnd = connector.getEnd(); i < iEnd; ++i)
        {
            if (colorOffset != null)
            {
                xCanvas = screenTransform.getVec3MultiplyX(userTransform.forwardX(connector.getValue(i, xOffset)));
                yCanvas = screenTransform.getVec3MultiplyY(userTransform.forwardY(connector.getValue(i, yOffset)));

                context.strokeStyle = isSegmentHighlighted(entity, i - 1)
                    ? highlightColor
                    : RgbaColorPacker.makeDomColorString(entity.data.getValue(i, colorOffset));

                context.lineTo(xCanvas, yCanvas);
                context.stroke();
                context.beginPath();
                context.moveTo(xCanvas, yCanvas);
            }
            else
            {
                if (isSegmentHighlighted(entity, i - 1))
                {
                    context.stroke();

                    context.beginPath();
                    context.moveTo(xCanvas, yCanvas);
                    context.strokeStyle = highlightColor;
                    xCanvas = screenTransform.getVec3MultiplyX(userTransform.forwardX(connector.getValue(i, xOffset)));
                    yCanvas = screenTransform.getVec3MultiplyY(userTransform.forwardY(connector.getValue(i, yOffset)));
                    context.lineTo(xCanvas, yCanvas);
                    context.stroke();

                    context.beginPath();
                    context.moveTo(xCanvas, yCanvas);
                    context.strokeStyle = defaultColor;
                }
                else
                {
                    xCanvas = screenTransform.getVec3MultiplyX(userTransform.forwardX(connector.getValue(i, xOffset)));
                    yCanvas = screenTransform.getVec3MultiplyY(userTransform.forwardY(connector.getValue(i, yOffset)));
                    context.lineTo(xCanvas, yCanvas);
                }
            }
        }

        if (colorOffset == null)
        {
            context.stroke();
        }
    }

    private pointProvider = new PointProvider();
    private valueProvider = new Indexed2dCappedLineValueProvider();
    private cappedLine = new CanvasVariableWidthCappedLine(this.valueProvider);
}

class PointProvider
{
    public p1: TF64Vec4 = new Vec4.f64();
    public p2: TF64Vec4 = new Vec4.f64();

    public update(
        entity: TInterleavedPoint2dTrait<TTypedArray>,
        index: number,
    )
        : void
    {
        const connector = entity.data;

        this.p1.update(
            connector.getValue(index, connector.offsets.x),
            connector.getValue(index, connector.offsets.y),
            connector.offsets.size == null ? 0 : connector.getValue(index, connector.offsets.size),
            getColor(entity, index) ?? 0,
        );
        this.p2.update(
            connector.getValue(index + 1, connector.offsets.x),
            connector.getValue(index + 1, connector.offsets.y),
            connector.offsets.size == null ? 0 : connector.getValue(index + 1, connector.offsets.size),
            getColor(entity, index + 1) ?? 0,
        );
    }
}

function getColor(entity: TInterleavedPoint2dTrait<TTypedArray>, index: number): number
{
    if (isSegmentHighlighted(entity, index))
    {
        return entity.graphicsSettings.pointDisplay.packedHighlightColor;
    }

    const colorOffset = entity.data.offsets.color;

    return colorOffset == null
        ? entity.graphicsSettings.pointDisplay.packedColor
        : entity.data.getValue(index, colorOffset);
}

function isSegmentHighlighted(entity: TInterleavedPoint2dTrait<TTypedArray>, index: number): boolean
{
    const pointDisplaySettings = entity.graphicsSettings.pointDisplay;
    return pointDisplaySettings.highlightedSegments != null && pointDisplaySettings.highlightedSegments.has(index);
}