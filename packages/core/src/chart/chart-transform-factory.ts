import { TUnknownComponentRenderer } from "../rendering/t-unknown-component-renderer";
import { _Debug, _Map } from "rc-js-util";
import { ITransformComponentFactory } from "../rendering/transform-components/i-transform-component-factory";
import { IRenderer } from "../rendering/i-renderer";
import { IGraphicsComponent } from "../rendering/graphics-components/i-graphics-component";
import { ITransformComponent } from "../rendering/transform-components/i-transform-component";
import { initializeGraphicsComponent } from "../rendering/graphics-components/initialize-graphics-component";

/**
 * @public
 */
export interface IChartTransformFactory<TComponentRenderer extends TUnknownComponentRenderer>
{
    addTransforms(transformFactories: readonly ITransformComponentFactory<TComponentRenderer>[]): IChartTransformFactory<TComponentRenderer>;
    addTransform(transformFactory: ITransformComponentFactory<TComponentRenderer>): IChartTransformFactory<TComponentRenderer>;
}

/**
 * @public
 */
export class ChartTransformFactory<TComponentRenderer extends TUnknownComponentRenderer>
    implements IChartTransformFactory<TComponentRenderer>
{
    public constructor
    (
        private readonly renderer: IRenderer<TUnknownComponentRenderer>,
        private readonly transformsToInitialize: readonly symbol[],
        private readonly missIsDebugError?: boolean,
    )
    {
    }

    public addTransforms(transformFactories: readonly ITransformComponentFactory<TComponentRenderer>[]): ChartTransformFactory<TComponentRenderer>
    {
        for (let i = 0, iEnd = transformFactories.length; i < iEnd; ++i)
        {
            this.addTransform(transformFactories[i]);
        }

        return this;
    }

    public addTransform(transformFactory: ITransformComponentFactory<TComponentRenderer>): ChartTransformFactory<TComponentRenderer>
    {
        const byBinderSymbol = _Map.initializeGet(this.transformMap, transformFactory.userTransformId, () => new Map());
        byBinderSymbol.set(transformFactory.binderId, transformFactory);

        return this;
    }

    public initializeTransformComponent(graphicsComponent: IGraphicsComponent<TUnknownComponentRenderer, unknown, unknown>): void
    {
        const transformBinder = graphicsComponent.transform.getTransformBinder();

        if (transformBinder == null)
        {
            // nothing to do, not a transformable component
            return;
        }

        const userTransforms = this.transformsToInitialize;
        const transformMap = this.transformMap;

        for (let i = 0, iEnd = userTransforms.length; i < iEnd; ++i)
        {
            const userTransform = userTransforms[i];
            const byBinderSymbol = transformMap.get(userTransform);

            if (byBinderSymbol == null)
            {
                DEBUG_MODE && _Debug.assert(!(this.missIsDebugError ?? false), "failed to find transform");
                continue;
            }

            const transformFactory = byBinderSymbol.get(transformBinder.binderClassificationId);

            if (transformFactory == null)
            {
                DEBUG_MODE && _Debug.assert(!(this.missIsDebugError ?? false), "failed to find transform");
                continue;
            }

            let transformComponent = transformFactory.createOne(transformBinder) as ITransformComponent<TComponentRenderer, unknown, unknown>;
            const equivTransformComp = this.renderer.graphicsComponents.getComponent(transformComponent.getCacheId());

            if (equivTransformComp == null)
            {
                // first time we've seen this component
                initializeGraphicsComponent(this.renderer, transformComponent);
            }
            else
            {
                transformComponent = equivTransformComp as ITransformComponent<TComponentRenderer, unknown, unknown>;
            }

            this.renderer.transformComponents.setTransform(userTransform, graphicsComponent, transformComponent);
        }
    }

    private transformMap = new Map<symbol, Map<symbol, ITransformComponentFactory<TComponentRenderer>>>();
}