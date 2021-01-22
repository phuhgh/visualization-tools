import { ICartesian2dUpdateArg } from "./cartesian2d-update-arg";
import { IReadonlyRange2d, TTypedArray } from "rc-js-util";
import { ICategoryUpdateHooks, IGlRenderer, TGlContext } from "@visualization-tools/core";

/**
 * @public
 * Canvas update hook, called before and after a plot is drawn.
 */
export class GlCartesianUpdateHooks implements ICategoryUpdateHooks<IGlRenderer<TGlContext, never>, ICartesian2dUpdateArg<Float32Array>>
{
    public constructor
    (
        private getDrawRange: (arg: ICartesian2dUpdateArg<Float32Array>) => IReadonlyRange2d<TTypedArray>,
    )
    {
    }

    public onBeforeUpdate
    (
        renderer: IGlRenderer<TGlContext, never>,
        arg: ICartesian2dUpdateArg<Float32Array>,
    )
        : void
    {
        renderer.sharedState.updateScissorRange(this.getDrawRange(arg));
    }

    public onAfterUpdate(): void
    {
        // no action needed
    }
}