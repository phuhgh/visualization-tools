import { TEntityTrait } from "../traits/t-entity-trait";
import { ICategoryUpdateHooks } from "./i-category-update-hooks";
import { IChartEntity } from "../chart-entity";
import { IEntityChangeHooks } from "./i-entity-change-hooks";
import { TUnknownComponentRenderer } from "../../rendering/t-unknown-component-renderer";
import { TGraphicsComponent } from "../../rendering/graphics-components/t-graphics-component";
import { TUnknownRenderer } from "../../rendering/t-unknown-renderer";

/**
 * @public
 * An entity sub-grouping. Provides hooks for entity membership changes, useful for normalization
 * of e.g. display parameters. Entity groups may optionally define categories.
 */
export interface IEntityCategory<TComponentRenderer extends TUnknownComponentRenderer, TUpdateArg, TRequiredTraits>
    extends IEntityCategoryWrite<TComponentRenderer, TUpdateArg, TRequiredTraits>,
            IEntityCategoryRead<TUpdateArg, TRequiredTraits>
{
}

/**
 * @public
 * The mutative methods of an {@link IEntityCategory}.
 */
export interface IEntityCategoryWrite<TComponentRenderer extends TUnknownComponentRenderer
    , TUpdateArg
    , TRequiredTraits>
{
    addEntity<TGraphicsTraits extends object, TCategoryTraits extends object>
    (
        entity: IChartEntity<TUpdateArg> & TGraphicsTraits & TCategoryTraits & TRequiredTraits,
        graphicsComponent: TGraphicsComponent<TComponentRenderer, TUpdateArg, TGraphicsTraits>,
        hooks?: IEntityChangeHooks<TCategoryTraits>,
    )
        : void;

    removeEntity(entity: IChartEntity<TUpdateArg>): void;

    TComponentRenderer: TComponentRenderer;
}

/**
 * @public
 * The non-mutative methods of an {@link IEntityCategory}.
 */
export interface IEntityCategoryRead<TUpdateArg, TTraits>
{
    getEntities(): TEntityTrait<TUpdateArg, TTraits>[];
    readonly updateHooks: ICategoryUpdateHooks<TUnknownRenderer, TUpdateArg>;
}