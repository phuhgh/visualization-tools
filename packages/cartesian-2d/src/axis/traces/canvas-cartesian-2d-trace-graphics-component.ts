import { RgbaColorPacker } from "rc-js-util";
import { ICartesian2dUpdateArg } from "../../update/update-arg/cartesian2d-update-arg";
import { TTrace2dDisplaySettingsTrait } from "../../traits/t-trace2d-display-settings-trait";
import { EGraphicsComponentType, ICanvasComponentRenderer, IDataTrait, IGraphicsComponent, NoTransformProvider } from "@visualization-tools/core";
import { ICartesian2dTraceEntityConnector } from "../cartesian-2d-trace-entity-connector";

/**
 * @public
 * Draws traces for cartesian 2d plots.
 */
export class CanvasCartesian2dTraceGraphicsComponent
    implements IGraphicsComponent<ICanvasComponentRenderer, ICartesian2dUpdateArg<Float64Array>, TTrace2dDisplaySettingsTrait & IDataTrait<ICartesian2dTraceEntityConnector<Float64Array>>>
{
    public readonly type = EGraphicsComponentType.Entity;
    public specification = {};
    public transform = new NoTransformProvider();

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
        renderer: ICanvasComponentRenderer,
        arg: ICartesian2dUpdateArg<Float64Array>,
    )
        : void
    {
        renderer.context.save();
        renderer.context.beginPath();
        const screenTransform = arg.drawTransforms.dataToInteractiveArea;
        const userTransform = arg.userTransform;
        renderer.context.strokeStyle = RgbaColorPacker.getHexColorString(entity.graphicsSettings.traceColor);
        renderer.context.lineWidth = entity.graphicsSettings.traceLinePixelSize;

        const yMin = screenTransform.getVec3MultiplyY(arg.transformedDataRange.getYMin());
        const yMax = screenTransform.getVec3MultiplyY(arg.transformedDataRange.getYMax());

        for (let i = 0, iEnd = entity.data.getXTraceCount(); i < iEnd; ++i)
        {
            const x = screenTransform.getVec3MultiplyX(userTransform.forwardX(entity.data.getXTick(i)));
            renderer.context.moveTo(x, yMin);
            renderer.context.lineTo(x, yMax);
        }

        const xMin = screenTransform.getVec3MultiplyX(arg.transformedDataRange.getXMin());
        const xMax = screenTransform.getVec3MultiplyX(arg.transformedDataRange.getXMax());

        for (let i = 0, iEnd = entity.data.getYTraceCount(); i < iEnd; ++i)
        {
            const y = screenTransform.getVec3MultiplyY(userTransform.forwardY(entity.data.getYTick(i)));
            renderer.context.moveTo(xMin, y);
            renderer.context.lineTo(xMax, y);
        }

        renderer.context.stroke();
        renderer.context.restore();
    }
}
