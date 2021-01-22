import { ICanvasDimensions } from "../templating/canvas-dimensions";
import { TUnknownRenderer } from "../rendering/i-renderer";
import { IEntityGroup } from "../entities/groups/a-entity-group";

/**
 * @public
 */
export interface IPlotUpdateStrategy<TUpdateGroup extends IEntityGroup<unknown, unknown>>
{
    updateGroup: TUpdateGroup;

    /**
     * Called on update to draw entities.
     */
    update
    (
        canvasDims: ICanvasDimensions,
        renderer: TUnknownRenderer,
    )
        : void;
}