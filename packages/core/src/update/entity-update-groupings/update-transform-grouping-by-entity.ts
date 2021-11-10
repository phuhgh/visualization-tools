import { IGraphicsComponent } from "../../rendering/graphics-components/i-graphics-component";
import { TUnknownComponentRenderer } from "../../rendering/t-unknown-component-renderer";
import { ITransformComponent } from "../../rendering/transform-components/i-transform-component";
import { TEntityTrait } from "../../entities/traits/t-entity-trait";
import { IEntityUpdateGrouping } from "./i-entity-update-grouping";
import { _Debug, _Equality } from "rc-js-util";
import { swapBufferLayout } from "./swap-buffer-layout";

/**
 * @public
 * An update grouping corresponding to {@link ICompositeGraphicsComponent.groupUpdatesByEntity} with transforms.
 */
export class UpdateTransformGroupingByEntity<TUpdateArg, TRequiredTraits>
    implements IEntityUpdateGrouping<TUpdateArg, TRequiredTraits>
{
    public constructor
    (
        public readonly graphicsComponents: IGraphicsComponent<TUnknownComponentRenderer, TUpdateArg, TRequiredTraits>[],
        public readonly componentRenderers: TUnknownComponentRenderer[],
        public readonly transformComponents: (ITransformComponent<TUnknownComponentRenderer, TUpdateArg, TRequiredTraits> | null)[],
        public readonly transformRenderers: (TUnknownComponentRenderer | null)[],
    )
    {
        DEBUG_MODE && _Debug.runBlock(() =>
        {
            const allEqualLength = _Equality.allEqual([
                graphicsComponents.length,
                componentRenderers.length,
                transformComponents.length,
                transformRenderers.length,
            ]);
            _Debug.assert(allEqualLength, "input length mismatch");
        });
        this.reuseTransform = this.getReuseTransforms(graphicsComponents, transformComponents);
    }

    public drawUpdateGroup
    (
        entities: TEntityTrait<TUpdateArg, TRequiredTraits>[],
        updateArg: TUpdateArg,
    )
        : void
    {
        const graphicsComponents = this.graphicsComponents;
        const entityRenderers = this.componentRenderers;
        const transformComponents = this.transformComponents;
        const transformRenderers = this.transformRenderers;
        const reuseTransforms = this.reuseTransform;

        for (let i = 0, iEnd = entities.length; i < iEnd; ++i)
        {
            const entity = entities[i];

            for (let j = 0, jEnd = graphicsComponents.length; j < jEnd; ++j)
            {
                const graphicsComponent = graphicsComponents[j];
                const componentRenderer = entityRenderers[j];
                const transformComponent = transformComponents[j];
                const transformRenderer = transformRenderers[j];
                const entityBufferLayout = componentRenderer.sharedState.entityBuffers.getLayout(entity, graphicsComponent.transform.groupId);

                // if the entity has buffers, use them
                swapBufferLayout(graphicsComponent, entityBufferLayout);

                // only perform the transform if the update group changes
                if (transformComponent != null && !reuseTransforms[j])
                {
                    DEBUG_MODE && _Debug.assert(transformRenderer != null, "precondition fail");

                    if (graphicsComponent.transform.isTransformRequired(entity, updateArg))
                    {
                        /* eslint-disable @typescript-eslint/no-non-null-assertion */
                        transformRenderer!.onBeforeDraw();
                        graphicsComponent.transform.setOutputBuffers(entity, transformRenderer!);
                        transformComponent.performTransform(entity, transformRenderer!, updateArg);
                        transformRenderer!.onAfterDraw();
                        /* eslint-enable @typescript-eslint/no-non-null-assertion */
                    }
                }
                // gc update
                componentRenderer.onBeforeDraw();
                graphicsComponent.onBeforeUpdate(componentRenderer, updateArg);
                graphicsComponent.update(entity, componentRenderer, updateArg);
                componentRenderer.onAfterDraw();

                // swap back
                swapBufferLayout(graphicsComponent, entityBufferLayout);
            }
        }
    }

    private getReuseTransforms
    (
        graphicsComponents: IGraphicsComponent<TUnknownComponentRenderer, TUpdateArg, TRequiredTraits>[],
        transformComponents: (ITransformComponent<TUnknownComponentRenderer, TUpdateArg, TRequiredTraits> | null)[],
    )
        : Uint8Array
    {
        const reuseTransforms = new Uint8Array(transformComponents.length);
        const lastTransformGroup = new Map<ITransformComponent<TUnknownComponentRenderer, TUpdateArg, TRequiredTraits>, number>();

        for (let i = 0, iEnd = transformComponents.length; i < iEnd; ++i)
        {
            const transform = transformComponents[i];
            const graphicsComponent = graphicsComponents[i];

            if (transform == null)
            {
                reuseTransforms[i] = 0;
                continue;
            }

            if (lastTransformGroup.get(transform) === graphicsComponent.transform.groupId)
            {
                reuseTransforms[i] = 1;
            }
            else
            {
                reuseTransforms[i] = 0;
                lastTransformGroup.set(transform, graphicsComponent.transform.groupId);
            }
        }

        return reuseTransforms;
    }

    protected readonly reuseTransform: Uint8Array;
}