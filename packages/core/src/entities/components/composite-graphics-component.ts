import { GraphicsSubComponents, IGraphicsSubComponents } from "../../rendering/graphics-components/graphics-sub-components";
import { TUnknownComponentRenderer } from "../../rendering/t-unknown-component-renderer";
import { IGraphicsComponent } from "../../rendering/graphics-components/i-graphics-component";
import { EGraphicsComponentType } from "../../rendering/graphics-components/e-graphics-component-type";
import { TGraphicsComponent } from "../../rendering/graphics-components/t-graphics-component";
import { linkGraphicsComponents } from "../../rendering/graphics-components/link-graphics-components";
import { ILinkableGraphicsComponent } from "../../rendering/graphics-components/i-linkable-graphics-component";
import { TLinkableCompositeGraphicsComponent } from "./t-linkable-composite-graphics-component";

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
export interface ICompositeGraphicsComponentFactory<TComponentRenderer extends TUnknownComponentRenderer, TUpdateArg, TTraits>
{
    addComponent<TAddedComponentRenderer extends TUnknownComponentRenderer, TComponentTraits>
    (
        graphicsComp: TGraphicsComponent<TAddedComponentRenderer, TUpdateArg, TComponentTraits>,
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
        graphicsComp: ILinkableGraphicsComponent<TAddedComponentRenderer, TUpdateArg, TComponentTraits> | ICompositeGraphicsComponent<TAddedComponentRenderer, TUpdateArg, TComponentTraits>,
    )
        : ILinkableCompositeGraphicsComponentFactory<TComponentRenderer & TAddedComponentRenderer, TUpdateArg, TTraits & TComponentTraits>;

    build(): ICompositeGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>;
}

/**
 * @public
 * Refer to update strategy documentation for draw call behavior.
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

    recurseIterate(callback: TUnfilteredIterateCallback<TComponentRenderer, TUpdateArg, TTraits>): void;
    recurseIterate(filter: EGraphicsComponentType.Entity, callback: TFilteredIterateCallback<TComponentRenderer, TUpdateArg, TTraits>): void;
    recurseIterate(filter: EGraphicsComponentType, callback: TUnfilteredIterateCallback<TComponentRenderer, TUpdateArg, TTraits>): void;
}

/**
 * @public
 */
export type TUnfilteredIterateCallback<TComponentRenderer extends TUnknownComponentRenderer, TUpdateArg, TTraits> =
    (
        component: TGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>,
        containingComponent: ICompositeGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>,
        componentIndex: number,
    )
        => void

/**
 * @public
 */
export type TFilteredIterateCallback<TComponentRenderer extends TUnknownComponentRenderer, TUpdateArg, TTraits> =
    (
        component: IGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>,
        containingComponent: ICompositeGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>,
        componentIndex: number,
    )
        => void

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
        graphicsComp: TGraphicsComponent<TAddedComponentRenderer, TUpdateArg, TComponentTraits>,
    )
        : CompositeGraphicsComponent<TComponentRenderer & TAddedComponentRenderer, TUpdateArg, TTraits & TComponentTraits>
    {
        this.subComponents.addComponent(graphicsComp as TGraphicsComponent<TComponentRenderer & TAddedComponentRenderer, TUpdateArg, TComponentTraits & TTraits>);
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

    public recurseIterate(callback: TUnfilteredIterateCallback<TComponentRenderer, TUpdateArg, TTraits>): void;
    public recurseIterate(filter: EGraphicsComponentType.Entity, callback: TFilteredIterateCallback<TComponentRenderer, TUpdateArg, TTraits>): void;
    public recurseIterate(filter: EGraphicsComponentType, callback: TUnfilteredIterateCallback<TComponentRenderer, TUpdateArg, TTraits>): void
    public recurseIterate
    (
        filterOrCallback: EGraphicsComponentType | TUnfilteredIterateCallback<TComponentRenderer, TUpdateArg, TTraits>,
        callback?: TFilteredIterateCallback<TComponentRenderer, TUpdateArg, TTraits>,
    )
        : void
    {
        if (callback == null)
        {
            this.recurseIterateImpl(
                filterOrCallback as TUnfilteredIterateCallback<TComponentRenderer, TUpdateArg, TTraits>,
                undefined,
                this,
            );
        }
        else
        {
            this.recurseIterateImpl(
                callback as TUnfilteredIterateCallback<TComponentRenderer, TUpdateArg, TTraits>,
                filterOrCallback as EGraphicsComponentType,
                this,
            );
        }
    }

    private recurseIterateImpl
    (
        callback: TUnfilteredIterateCallback<TComponentRenderer, TUpdateArg, TTraits>,
        filter: EGraphicsComponentType | undefined,
        composite: ICompositeGraphicsComponent<TComponentRenderer, TUpdateArg, TTraits>,
    )
        : void
    {
        const comps = composite.subComponents.getSubComponents();

        for (let i = 0, iEnd = comps.length; i < iEnd; ++i)
        {
            const comp = comps[i];

            if (filter == null || filter === comp.type)
            {
                callback(comp, composite, i);
            }

            if (comp.type === EGraphicsComponentType.Composite)
            {
                this.recurseIterateImpl(callback, filter, comp);
            }
        }
    }
}