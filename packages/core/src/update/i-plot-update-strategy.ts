import { ICanvasDimensions } from "../templating/canvas-dimensions";
import { IEntityGroup } from "../entities/groups/a-entity-group";
import { TUnknownRenderer } from "../rendering/t-unknown-renderer";

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