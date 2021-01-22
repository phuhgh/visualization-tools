import { IGraphicsComponentSpecification } from "../../rendering/i-graphics-component-specification";
import { GraphicsSubComponents } from "../../rendering/graphics-sub-components";
import { _Array, Once } from "rc-js-util";
import { TUnknownEntityRenderer } from "../../rendering/t-unknown-entity-renderer";
import { TExtractGcSpec } from "../../rendering/t-extract-gc-spec";

/**
 * @public
 * Provided as a means to compose graphics components; it does not infer / bestow any behaviors. Refer to update strategy
 * documentation for draw call behavior.
 *
 * @remarks
 * An instance with the appropriate types can be obtained from the renderer (on ChartComponent).
 */
export class CompositeGraphicsComponent<TEntityRenderer extends TUnknownEntityRenderer, TUpdateArg, TTraits>
    implements IGraphicsComponentSpecification<TEntityRenderer, TUpdateArg, TTraits>
{
    public readonly subComponents: GraphicsSubComponents<TEntityRenderer, TUpdateArg, TTraits>;
    public groupUpdatesByEntity?: boolean;

    public static createOne<TEntityRenderer extends TUnknownEntityRenderer, TUpdateArg, TTraits>
    (
        specification: TExtractGcSpec<TEntityRenderer>,
        graphicsComp: IGraphicsComponentSpecification<TEntityRenderer, TUpdateArg, TTraits>,
    )
        : CompositeGraphicsComponent<TEntityRenderer, TUpdateArg, TTraits>
    {
        return new CompositeGraphicsComponent(specification, graphicsComp);
    }

    public constructor
    (
        public readonly specification: TExtractGcSpec<TEntityRenderer>,
        graphicsComp: IGraphicsComponentSpecification<TEntityRenderer, TUpdateArg, TTraits>,
    )
    {
        this.graphicsComps = [graphicsComp];
        this.subComponents = new GraphicsSubComponents(this.graphicsComps);
    }

    public addComponent<TComponentTraits>
    (
        graphicsComp: IGraphicsComponentSpecification<TEntityRenderer, TUpdateArg, TComponentTraits>,
    )
        : CompositeGraphicsComponent<TEntityRenderer, TUpdateArg, TTraits & TComponentTraits>
    {
        this.graphicsComps.push(graphicsComp as IGraphicsComponentSpecification<TEntityRenderer, TUpdateArg, TComponentTraits & TTraits>);
        return this as CompositeGraphicsComponent<TEntityRenderer, TUpdateArg, TTraits & TComponentTraits>;
    }

    @Once
    public getCacheId(): string
    {
        return _Array.map(this.graphicsComps, comp => comp.getCacheId()).join("_");
    }

    public initialize(): void
    {
        const comps = this.graphicsComps;
        const entityRenderers = this.subComponents.entityRenderers;

        for (let i = 0, iEnd = comps.length; i < iEnd; ++i)
        {
            comps[i].initialize(entityRenderers[i] as TEntityRenderer);
        }
    }

    public onBeforeUpdate(): void
    {
        // updates are handled by the update strategy
    }

    public update(): void
    {
        // updates are handled by the update strategy
    }

    private readonly graphicsComps: IGraphicsComponentSpecification<TEntityRenderer, TUpdateArg, TTraits>[];
}