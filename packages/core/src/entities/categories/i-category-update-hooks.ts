import { TUnknownRenderer } from "../../rendering/t-unknown-renderer";

/**
 * @public
 * Update hooks of {@link IEntityCategory}.
 */
export interface ICategoryUpdateHooks<TRenderer extends TUnknownRenderer, TUpdateArg>
{
    onBeforeUpdate(renderer: TRenderer, arg: TUpdateArg): void;
    onAfterUpdate(renderer: TRenderer, arg: TUpdateArg): void;
}