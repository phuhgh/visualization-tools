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
            entity.graphicsSettings.pointDisplay.highlightedSegments = null;
            break;
        }
        case EHoverState.Unchanged:
        case EHoverState.Entered:
        case EHoverState.SegmentChange:
        {
            entity.graphicsSettings.pointDisplay.highlightedSegments = segments;
            break;
        }
        default:
            _Production.assertValueIsNever(state);
    }
}