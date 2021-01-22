import { TPoint2dDisplaySettingsTrait } from "../traits/t-point2d-display-settings-trait";
import { EHoverState, TChangeTrackedTrait } from "@visualization-tools/core";
import { _Production } from "rc-js-util";

/**
 * @public
 * Updates the state of an entity that receives a hover event.
 */
export function hoverHighlightLineSegment
(
    entity: TPoint2dDisplaySettingsTrait & TChangeTrackedTrait,
    state: EHoverState,
    segments: ReadonlySet<number>,
)
    : void
{
    entity.updateChangeId();

    switch (state)
    {
        case EHoverState.Left:
        {
            entity.graphicsSettings.pointDisplay.colorOverrides = null;
            break;
        }
        case EHoverState.Entered:
        case EHoverState.SegmentChange:
        {
            const color = entity.graphicsSettings.pointDisplay
                .getHighlightColor()
                .getPackedRGBAColor(true);

            const colorOverrides = entity.graphicsSettings.pointDisplay.colorOverrides = new Array(segments.size * 2);
            let index = 0;

            for (const segmentId of segments)
            {
                // FIXME can we generate less garbage?
                colorOverrides[index] = [segmentId, new Float32Array([color])];
                colorOverrides[index + 1] = [segmentId + 1, new Float32Array([color])];
                index += 2;
            }

            break;
        }
        default:
            _Production.assertValueIsNever(state);
    }
}