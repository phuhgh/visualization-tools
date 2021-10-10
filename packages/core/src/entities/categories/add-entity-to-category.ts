import { IEntityCategory } from "./i-entity-category";
import { TUnknownComponentRenderer } from "../../rendering/t-unknown-component-renderer";
import { IChartEntity } from "../chart-entity";
import { IEntityChangeHooks } from "./i-entity-change-hooks";
import { TGraphicsComponent } from "../../rendering/graphics-components/t-graphics-component";

// FIXME: sanitize / hide interfaces that assert the wrong way around, maybe attach this elsewhere for discoverability
/**
 * @public
 */
export function addEntityToCategory<TComponentRenderer extends TUnknownComponentRenderer
    , TSystemComponentRenderer extends TComponentRenderer
    , TGraphicsTraits extends object
    , TCategoryTraits extends object
    , TUpdateArg
    , TRequiredTraits>
(
    category: IEntityCategory<TSystemComponentRenderer, TUpdateArg, TRequiredTraits>,
    entity: IChartEntity<TUpdateArg> & TGraphicsTraits & TCategoryTraits & TRequiredTraits,
    graphicsComponent: TGraphicsComponent<TComponentRenderer, TUpdateArg, TGraphicsTraits>,
    hooks?: IEntityChangeHooks<TCategoryTraits>,
)
    : void
{
    category.addEntity(
        entity,
        graphicsComponent as TGraphicsComponent<TSystemComponentRenderer, TUpdateArg, TGraphicsTraits>,
        hooks,
    );
}