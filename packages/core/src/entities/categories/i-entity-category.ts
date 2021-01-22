import { TEntityTrait } from "../traits/t-entity-trait";
import { ICategoryUpdateHooks } from "./i-category-update-hooks";
import { IChartEntity } from "../chart-entity";
import { IGraphicsComponentSpecification } from "../../rendering/i-graphics-component-specification";
import { IEntityChangeHooks } from "./i-entity-change-hooks";
import { TUnknownEntityRenderer } from "../../rendering/t-unknown-entity-renderer";
import { TUnknownRenderer } from "../../rendering/i-renderer";

/**
 * @public
 * An entity sub-grouping. Provides hooks for entity membership changes, useful for normalization
 * of e.g. display parameters. Entity groups may optionally define categories.
 */
export interface IEntityCategory<TEntityRenderer extends TUnknownEntityRenderer, TUpdateArg, TRequiredTraits>
    extends IEntityCategoryWrite<TEntityRenderer, TUpdateArg, TRequiredTraits>,
            IEntityCategoryRead<TUpdateArg, TRequiredTraits>
{
}

/**
 * @public
 * The mutative methods of an {@link IEntityCategory}.
 */
export interface IEntityCategoryWrite<TEntityRenderer extends TUnknownEntityRenderer
    , TUpdateArg
    , TRequiredTraits>
{
    addEntity<TGraphicsTraits extends object, TCategoryTraits extends object>
    (
        entity: IChartEntity<TUpdateArg> & TGraphicsTraits & TCategoryTraits & TRequiredTraits,
        graphicsComponent: IGraphicsComponentSpecification<TEntityRenderer, TUpdateArg, TGraphicsTraits>,
        hooks?: IEntityChangeHooks<TCategoryTraits>,
    )
        : void;

    removeEntity(entity: IChartEntity<TUpdateArg>): void;
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