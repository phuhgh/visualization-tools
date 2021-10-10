import { GraphicsSubComponents, IGraphicsSubComponents } from "../../rendering/graphics-components/graphics-sub-components";
import { TUnknownComponentRenderer } from "../../rendering/t-unknown-component-renderer";
import { IGraphicsComponent } from "../../rendering/graphics-components/i-graphics-component";
import { EGraphicsComponentType } from "../../rendering/graphics-components/e-graphics-component-type";
import { _Production } from "rc-js-util";
import { TGraphicsComponent } from "../../rendering/graphics-components/t-graphics-component";
import { linkGraphicsComponents } from "../../rendering/graphics-components/link-graphics-components";
import { ILinkableGraphicsComponent } from "../../rendering/graphics-components/i-linkable-graphics-component";

/**
 * @public
 */
export type TCompositeGraphicsComponent<TComponentRenderer extends TUnknownComponentRenderer, TUpdateArg, TTraits> =
    & ICompositeGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>
    & ICompositeGraphicsComponentFactory<TComponentRenderer, TUpdateArg, TTraits>
    ;

/**
 * @public
 */
export type TLinkableCompositeGraphicsComponent<TComponentRenderer extends TUnknownComponentRenderer, TUpdateArg, TTraits> =
    & ICompositeGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>
    & ILinkableCompositeGraphicsComponentFactory<TComponentRenderer, TUpdateArg, TTraits>
    ;

/**
 * @public
 */
export interface ICompositeGraphicsComponentFactory<TComponentRenderer extends TUnknownComponentRenderer, TUpdateArg, TTraits>
{
    addComponent<TAddedComponentRenderer extends TUnknownComponentRenderer, TComponentTraits>
    (
        graphicsComp: IGraphicsComponent<TAddedComponentRenderer, TUpdateArg, TComponentTraits>,
    )
        : ICompositeGraphicsComponentFactory<TComponentRenderer & TAddedComponentRenderer, TUpdateArg, TTraits & TComponentTraits>;

    build(): ICompositeGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>;
}

/**
 * @public
 */
export interface ILinkableCompositeGraphicsComponentFactory<TComponentRenderer extends TUnknownComponentRenderer, TUpdateArg, TTraits>
{
    addComponent<TAddedComponentRenderer extends TUnknownComponentRenderer, TComponentTraits>
    (
        graphicsComp: ILinkableGraphicsComponent<TAddedComponentRenderer, TUpdateArg, TComponentTraits>,
    )
        : ILinkableCompositeGraphicsComponentFactory<TComponentRenderer & TAddedComponentRenderer, TUpdateArg, TTraits & TComponentTraits>;

    build(): ICompositeGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>;
}

/**
 * @public
 * Provided as a means to compose graphics components; it does not infer / bestow any behaviors. Refer to update strategy
 * documentation for draw call behavior.
 *
 * @remarks
 * Any duplicate graphics components (by instance) will be eliminated, regardless of how nested they are.
 *
 */
export interface ICompositeGraphicsComponent<TComponentRenderer extends TUnknownComponentRenderer, TUpdateArg, TTraits>
{
    readonly type: EGraphicsComponentType.Composite;
    readonly subComponents: IGraphicsSubComponents<TComponentRenderer, TUpdateArg, TTraits>;
    /**
     * Instead of batching entities into update groups based on the subcomponents, update entities in turn cycling through
     * the subcomponents. With large shared buffers and few entities this can significantly improve performance.
     *
     * @remarks
     * When this is true it applies to any nested composite component as well. Graphics components should be linked
     * using {@link linkGraphicsComponents} in this case.
     */
    readonly groupUpdatesByEntity: boolean;

    recurseIterate(callback: (component: TGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>) => void): void;
    recurseIterate(filter: EGraphicsComponentType.Entity, callback: (component: IGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>) => void): void;
}

/**
 * @public
 * {@inheritDoc ICompositeGraphicsComponent}
 */
export class CompositeGraphicsComponent<TComponentRenderer extends TUnknownComponentRenderer, TUpdateArg, TTraits>
    implements ICompositeGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>,
               ILinkableCompositeGraphicsComponentFactory<TComponentRenderer, TUpdateArg, TTraits>
{
    public readonly type = EGraphicsComponentType.Composite;
    public readonly subComponents: GraphicsSubComponents<TComponentRenderer, TUpdateArg, TTraits>;
    public readonly groupUpdatesByEntity: boolean;

    public static createOne<TComponentRenderer extends TUnknownComponentRenderer, TUpdateArg, TTraits>
    (
        graphicsComp: IGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>,
    )
        : TCompositeGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>
    {
        return new CompositeGraphicsComponent(graphicsComp, false);
    }

    public static createOneLinked<TComponentRenderer extends TUnknownComponentRenderer, TUpdateArg, TTraits>
    (
        graphicsComp: IGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>,
    )
        : TLinkableCompositeGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>
    {
        return new CompositeGraphicsComponent(graphicsComp, true);
    }

    public constructor
    (
        graphicsComp: IGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>,
        groupUpdatesByEntity: boolean,
    )
    {
        this.subComponents = new GraphicsSubComponents([graphicsComp]);
        this.groupUpdatesByEntity = groupUpdatesByEntity;

    }

    public addComponent<TAddedComponentRenderer extends TUnknownComponentRenderer, TComponentTraits>
    (
        graphicsComp: IGraphicsComponent<TAddedComponentRenderer, TUpdateArg, TComponentTraits>,
    )
        : CompositeGraphicsComponent<TComponentRenderer & TAddedComponentRenderer, TUpdateArg, TTraits & TComponentTraits>
    {
        this.subComponents.addComponent(graphicsComp as IGraphicsComponent<TComponentRenderer & TAddedComponentRenderer, TUpdateArg, TComponentTraits & TTraits>);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this as CompositeGraphicsComponent<any, TUpdateArg, TTraits & TComponentTraits>;
    }

    public build(): ICompositeGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>
    {
        if (this.groupUpdatesByEntity)
        {
            linkGraphicsComponents(this.subComponents.getSubComponents() as ILinkableGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>[]);
        }

        return this;
    }

    public recurseIterate(callback: (component: TGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>) => void): void;
    public recurseIterate(filter: EGraphicsComponentType.Entity, callback: (component: IGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>) => void): void;
    public recurseIterate(filter: number, callback: (component: TGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>) => void): void
    public recurseIterate
    (
        filterOrCallback: EGraphicsComponentType | ((component: TGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>) => void),
        callback?: (component: IGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>) => void,
    )
        : void
    {
        if (callback != null)
        {
            this.recurseIterateImpl(
                callback as (component: TGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>) => void,
                filterOrCallback as EGraphicsComponentType,
            );
        }
        else
        {
            this.recurseIterateImpl(filterOrCallback as () => void, undefined);
        }
    }

    private recurseIterateImpl
    (
        callback: (component: TGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>) => void,
        filter: EGraphicsComponentType | undefined,
    )
        : void
    {
        const comps = this.subComponents.getSubComponents();

        for (let i = 0, iEnd = comps.length; i < iEnd; ++i)
        {
            const comp = comps[i];

            if (filter != null && !(comp.type & filter))
            {
                continue;
            }

            switch (comp.type)
            {
                case EGraphicsComponentType.Entity:
                {
                    callback(comp);
                    break;
                }
                case EGraphicsComponentType.Composite:
                {
                    callback(comp);
                    break;
                }
                default:
                    _Production.assertValueIsNever(comp);
            }
        }
    }
}