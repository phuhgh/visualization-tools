import { _Array, _Debug, _Map, _Math, _Production } from "rc-js-util";
import { EGraphicsComponentType, IGraphicsComponent, TEntityTrait, TGraphicsComponent, TUnknownComponentRenderer } from "@visualization-tools/core";
import { IScene2d } from "./i-scene2d";
import { I2dEntityCategoryRead } from "../update-group/i2d-entity-category-read";
import { T2dZIndexesTrait } from "../../traits/t2d-z-indexes-trait";
import { IUpdate2dGroup } from "../update-group/update-2d-group";

/**
 * @public
 * sorts entities by z order.
 */
export class Scene2dCategorySorted<TPlotRange, TUpdateArg, TRequiredTraits extends T2dZIndexesTrait>
    implements IScene2d<TPlotRange, TUpdateArg, TRequiredTraits>
{
    public constructor
    (
        private update2dGroup: IUpdate2dGroup<TPlotRange, TUpdateArg, TRequiredTraits>,
    )
    {
    }

    public getSortedCategories
    (
        updateGroup: IUpdate2dGroup<TPlotRange, TUpdateArg, TRequiredTraits>,
    )
        : readonly I2dEntityCategoryRead<TUpdateArg, TRequiredTraits>[]
    {
        return updateGroup.categories
            .toArray()
            .slice()
            .sort((a, b) => a.zIndex - b.zIndex);
    }

    public getEntitiesByComponents
    (
        category: I2dEntityCategoryRead<TUpdateArg, TRequiredTraits>,
    )
        : readonly [TGraphicsComponent<TUnknownComponentRenderer, TUpdateArg, TRequiredTraits>, TEntityTrait<TUpdateArg, TRequiredTraits>[]][]
    {
        const entitiesByCollection = _Array.collect(
            category.getEntities(),
            new Map<IGraphicsComponent<TUnknownComponentRenderer, TUpdateArg, TRequiredTraits>, TEntityTrait<TUpdateArg, TRequiredTraits>[]>(),
            (entitiesByComponent, entity) =>
            {
                const component = this.update2dGroup.graphicsComponents.getComponent(entity);

                this.collectComponents(entitiesByComponent, component, entity);
            },
        );

        return Array.from(entitiesByCollection.entries());
    }

    private collectComponents
    (
        entitiesByComponent: Map<TGraphicsComponent<TUnknownComponentRenderer, TUpdateArg, TRequiredTraits>, TEntityTrait<TUpdateArg, TRequiredTraits>[]>,
        component: TGraphicsComponent<TUnknownComponentRenderer, TUpdateArg, unknown>,
        entity: TEntityTrait<TUpdateArg, TRequiredTraits>,
    )
        : void
    {
        switch (component.type)
        {
            case EGraphicsComponentType.Composite:
            {
                if (component.groupUpdatesByEntity)
                {
                    _Map.push(entitiesByComponent, component, entity);
                }
                else
                {
                    const components = component.subComponents.getSubComponents();

                    for (let i = 0, iEnd = components.length; i < iEnd; ++i)
                    {
                        this.collectComponents(entitiesByComponent, components[i], entity);
                    }
                }

                break;
            }
            case EGraphicsComponentType.Entity:
            {
                _Map.push(entitiesByComponent, component, entity);
                break;
            }
            default:
                _Production.assertValueIsNever(component);
        }
    }

    public update(): void
    {
        const zRange = this.getZRange(this.update2dGroup);
        const squashFactor = -1 / _Math.max(zRange, 1);
        let prev = 0;

        const categories = this.getSortedCategories(this.update2dGroup);

        for (let i = 0, iEnd = categories.length; i < iEnd; i++)
        {
            const category = categories[i];
            const entities = category.getEntities();

            for (let j = 0, jEnd = entities.length; j < jEnd; j++)
            {
                const settings = entities[j].graphicsSettings;
                DEBUG_MODE && _Debug.assert(settings.zIndexRel >= 0, "expected ZIndexRel to be set");
                settings.zIndexAbs = (prev + settings.zIndexRel) * squashFactor;
            }

            prev += category.entityZIndexRange + 1;
        }
    }

    private getZRange
    (
        updateGroup: IUpdate2dGroup<TPlotRange, TUpdateArg, TRequiredTraits>,
    )
        : number
    {
        let range = 0;

        const categories = updateGroup.categories.toArray();

        for (let i = 0, iEnd = categories.length; i < iEnd; i++)
        {
            const category = categories[i];

            if (category.getEntities().length !== 0)
            {
                range += category.entityZIndexRange + 1;
            }
        }

        return range;
    }
}