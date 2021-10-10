import { T2dZIndexesTrait } from "../traits/t2d-z-indexes-trait";
import { DirtyCheckedUniqueCollection } from "rc-js-util";
import { I2dEntityCategoryRead } from "./update-group/i2d-entity-category-read";

// todo jack26: update this on entity added or removed, generally add dirty checking flags
/**
 * @public
 * Assigns a value to {@link T2dRelativeZIndexTrait} based on the position in the stack. Entities towards the top of the
 * stack have higher values.
 */
export class CategoryStack2d
{
    public constructor
    (
        private readonly category: I2dEntityCategoryRead<unknown, unknown>,
    )
    {
    }

    public addEntity(entity: T2dZIndexesTrait): void
    {
        this.entities.add(entity);
    }

    public update(): void
    {
        if (!this.entities.isDirty)
        {
            return;
        }

        const entities = this.entities.getArray();
        this.category.entityZIndexRange = entities.length;

        for (let i = 0, iEnd = entities.length; i < iEnd; ++i)
        {
            entities[i].graphicsSettings.zIndexRel = i;
        }
    }

    private entities = new DirtyCheckedUniqueCollection<T2dZIndexesTrait>();
}