import { EGraphicsComponentType, ICanvasComponentRenderer, IGraphAttachPoint, IGraphicsComponent, NoTransformProvider, SpriteLookup } from "@visualization-tools/core";
import { ICartesian2dUpdateArg } from "../../update/update-arg/cartesian2d-update-arg";
import { Cartesian2dAxisLabelGenerator } from "./cartesian-2d-axis-label-generator";
import { TAxisLabelEntity } from "./t-axis-label-entity";

/**
 * @public
 * Draws labels for cartesian 2d plots.
 */
export class CanvasCartesian2dAxisLabelGraphicsComponent
    implements IGraphicsComponent<ICanvasComponentRenderer, ICartesian2dUpdateArg<Float64Array>, TAxisLabelEntity<Float64Array>>
{
    public readonly type = EGraphicsComponentType.Entity;
    public specification = {};
    public transform = new NoTransformProvider();

    public constructor
    (
        attachPoint: IGraphAttachPoint,
        private readonly axisLabelGenerator: Cartesian2dAxisLabelGenerator = new Cartesian2dAxisLabelGenerator(attachPoint),
    )
    {
    }

    public getCacheId(): string
    {
        return "CanvasAxisGraphicsComponent";
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
        entity: TAxisLabelEntity<Float64Array>,
        componentRenderer: ICanvasComponentRenderer,
        updateArg: ICartesian2dUpdateArg<Float64Array>,
    )
        : void
    {
        const context = componentRenderer.context;
        const dataToCanvasTransform = updateArg.drawTransforms.dataToInteractiveArea;
        const userTransform = updateArg.userTransform;
        const lookup = this.axisLabelGenerator.update(entity, updateArg.canvasDimensions.dpr);
        const canvas = this.axisLabelGenerator.getCanvas();

        const paddingXAxis = entity.graphicsSettings.axisOptions.padding * updateArg.canvasDimensions.dpr;
        const graphY = dataToCanvasTransform.getVec3MultiplyY(updateArg.transformedDataRange.getYMin());

        context.save();

        for (let i = 0, iEnd = entity.data.getXTraceCount(); i < iEnd; ++i)
        {
            const graphX = dataToCanvasTransform.getVec3MultiplyX(userTransform.forwardX(entity.data.getXTick(i)));
            const spriteX = SpriteLookup.getXAtIndex(lookup, i);
            const spriteY = SpriteLookup.getYAtIndex(lookup, i);
            const spriteWidth = SpriteLookup.getWidthAtIndex(lookup, i);
            const spriteHeight = SpriteLookup.getHeightAtIndex(lookup, i);

            context.drawImage(
                canvas,
                // position in sprite
                spriteX,
                spriteY,
                spriteWidth,
                spriteHeight,
                // position in graph
                graphX - spriteWidth * 0.5, // center about the trace
                graphY + paddingXAxis,
                spriteWidth,
                spriteHeight,
            );
        }

        const xTraceCount = entity.data.getXTraceCount();
        const graphX = dataToCanvasTransform.getVec3MultiplyX(updateArg.transformedDataRange.getXMin());
        const paddingYAxis = entity.graphicsSettings.axisOptions.padding * updateArg.canvasDimensions.dpr;

        for (let i = 0, iEnd = entity.data.getYTraceCount(); i < iEnd; ++i)
        {
            const spriteIndex = xTraceCount + i;
            const graphY = dataToCanvasTransform.getVec3MultiplyY(userTransform.forwardY(entity.data.getYTick(i)));
            const spriteX = SpriteLookup.getXAtIndex(lookup, spriteIndex);
            const spriteY = SpriteLookup.getYAtIndex(lookup, spriteIndex);
            const spriteWidth = SpriteLookup.getWidthAtIndex(lookup, spriteIndex);
            const spriteHeight = SpriteLookup.getHeightAtIndex(lookup, spriteIndex);

            context.drawImage(
                canvas,
                // position in sprite
                spriteX,
                spriteY,
                spriteWidth,
                spriteHeight,
                // position in graph
                graphX - spriteWidth - paddingYAxis,
                graphY - spriteHeight * 0.5, // center about the trace
                spriteWidth,
                spriteHeight,
            );
        }

        context.restore();
    }
}
