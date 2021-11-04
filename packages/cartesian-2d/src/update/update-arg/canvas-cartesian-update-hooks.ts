import { ICartesian2dUpdateArg } from "./cartesian2d-update-arg";
import { IReadonlyRange2d, TTypedArray } from "rc-js-util";
import { ICanvasRenderer, ICategoryUpdateHooks } from "@visualization-tools/core";

/**
 * @public
 * Canvas update hook, called before and after a plot is drawn.
 */
export class CanvasCartesianUpdateHooks implements ICategoryUpdateHooks<ICanvasRenderer, ICartesian2dUpdateArg<Float64Array>>
{
    public constructor
    (
        private getDrawRange: (arg: ICartesian2dUpdateArg<Float64Array>) => IReadonlyRange2d<TTypedArray>,
    )
    {
    }

    public onAfterUpdate(renderer: ICanvasRenderer): void
    {
        renderer.sharedState.updateScissorRange(null);
    }

    public onBeforeUpdate(renderer: ICanvasRenderer, arg: ICartesian2dUpdateArg<Float64Array>): void
    {
        renderer.sharedState.updateScissorRange(this.getDrawRange(arg));
    }
}