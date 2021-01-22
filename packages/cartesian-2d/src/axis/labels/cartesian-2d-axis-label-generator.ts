import { TAxisLabelEntity } from "./t-axis-label-entity";
import { TTypedArray } from "rc-js-util";
import { IGraphAttachPoint, SpriteLookup, SpriteProvider } from "@visualization-tools/core";

/**
 * @public
 * Generates sprites for axis labels.
 */
export class Cartesian2dAxisLabelGenerator
{
    public constructor
    (
        attachPoint: IGraphAttachPoint,
        private spriteProvider: SpriteProvider = new SpriteProvider(attachPoint),
    )
    {
    }

    public getCanvas(): HTMLCanvasElement
    {
        return this.spriteProvider.getCanvas();
    }

    public update(entity: TAxisLabelEntity<TTypedArray>, dpr: number): SpriteLookup
    {
        const formattingOptions = entity.graphicsSettings.axisOptions;

        if (formattingOptions.isDirty)
        {
            formattingOptions.regenerate(dpr);
        }

        const connector = entity.data;
        const labelW = formattingOptions.maxWidth * dpr;
        const labelH = formattingOptions.fontSize * dpr;
        this.spriteProvider.upscaleCanvas(labelW, connector.getTraceCount() * labelH);
        const spriteLookup = Cartesian2dAxisLabelGenerator.generateSpriteLookup(entity, dpr);

        const context = this.spriteProvider.getContext();
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.font = formattingOptions.fontString;
        // FIXME these should be part of the options
        context.textBaseline = "middle";
        context.textAlign = "center";

        const xTraceCount = connector.getXTraceCount();
        const hh = labelH * 0.5 + 0.5;

        for (let i = 0; i < xTraceCount; ++i)
        {
            const y = SpriteLookup.getYAtIndex(spriteLookup, i);
            context.fillText(formattingOptions.formatNumber(connector.getXTick(i)), labelW * 0.5, y + hh, labelW);
        }

        context.textAlign = "right";
        for (let i = 0, iEnd = connector.getYTraceCount(); i < iEnd; ++i)
        {
            const y = SpriteLookup.getYAtIndex(spriteLookup, xTraceCount + i);
            context.fillText(formattingOptions.formatNumber(connector.getYTick(i)), labelW, y + hh, labelW);
        }

        return spriteLookup;
    }

    private static generateSpriteLookup
    (
        entity: TAxisLabelEntity<TTypedArray>,
        dpr: number,
    )
        : SpriteLookup
    {
        const labelCount = entity.data.getTraceCount();
        const formattingOptions = entity.graphicsSettings.axisOptions;
        const spriteLookup = SpriteLookup.createOne(labelCount);
        const labelH = formattingOptions.fontSize * dpr;
        const labelW = formattingOptions.maxWidth * dpr;

        for (let i = 0; i < labelCount; ++i)
        {
            SpriteLookup.setSpriteAtIndex(spriteLookup, i, 0, labelH * i, labelW, labelH);
        }

        return spriteLookup;
    }
}