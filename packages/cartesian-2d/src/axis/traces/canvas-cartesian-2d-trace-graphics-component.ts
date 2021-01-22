import { RgbaColorPacker } from "rc-js-util";
import { ICartesian2dUpdateArg } from "../../update/cartesian2d-update-arg";
import { TTrace2dDisplaySettingsTrait } from "../../traits/t-trace2d-display-settings-trait";
import { ICanvasEntityRenderer, IDataTrait, IGraphicsComponentSpecification } from "@visualization-tools/core";
import { ICartesian2dTraceEntityConnector } from "../cartesian-2d-trace-entity-connector";

/**
 * @public
 * Draws traces for cartesian 2d plots.
 */
export class CanvasCartesian2dTraceGraphicsComponent
    implements IGraphicsComponentSpecification<ICanvasEntityRenderer, ICartesian2dUpdateArg<Float64Array>, TTrace2dDisplaySettingsTrait & IDataTrait<ICartesian2dTraceEntityConnector<Float64Array>>>
{
    public specification = {};

    public getCacheId(): string
    {
        return "CanvasTraceGraphicsComponent";
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
        entity: TTrace2dDisplaySettingsTrait & IDataTrait<ICartesian2dTraceEntityConnector<Float64Array>>,
        renderer: ICanvasEntityRenderer,
        arg: ICartesian2dUpdateArg<Float64Array>,
    )
        : void
    {
        renderer.context.beginPath();
        const transform = arg.drawTransforms.dataToInteractiveArea;
        renderer.context.strokeStyle = RgbaColorPacker.getHexColorString(entity.graphicsSettings.traceColor);
        renderer.context.lineWidth = entity.graphicsSettings.traceLinePixelSize;

        const yMin = transform.getVec3MultiplyY(arg.plotRange.getYMin());
        const yMax = transform.getVec3MultiplyY(arg.plotRange.getYMax());

        for (let i = 0, iEnd = entity.data.getXTraceCount(); i < iEnd; ++i)
        {
            const x = transform.getVec3MultiplyX(entity.data.getXTick(i));
            renderer.context.moveTo(x, yMin);
            renderer.context.lineTo(x, yMax);
        }

        const xMin = transform.getVec3MultiplyX(arg.plotRange.getXMin());
        const xMax = transform.getVec3MultiplyX(arg.plotRange.getXMax());

        for (let i = 0, iEnd = entity.data.getYTraceCount(); i < iEnd; ++i)
        {
            const y = transform.getVec3MultiplyY(entity.data.getYTick(i));
            renderer.context.moveTo(xMin, y);
            renderer.context.lineTo(xMax, y);
        }

        renderer.context.closePath();
        renderer.context.stroke();
    }
}
