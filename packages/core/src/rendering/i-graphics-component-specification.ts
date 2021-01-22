import { ICacheable } from "./i-cacheable";
import { IGraphicsSubComponents } from "./graphics-sub-components";
import { TUnknownEntityRenderer } from "./t-unknown-entity-renderer";
import { TExtractGcSpec } from "./t-extract-gc-spec";

/**
 * @public
 * The minimum specification of a graphics component such that {@link IEntityRendererFactory} can generate entity renderers.
 */
export interface IGraphicsComponentSpecification<TEntityRenderer extends TUnknownEntityRenderer
    , TUpdateArg
    , TEntityTraits>
    extends ICacheable
{
    readonly specification: TExtractGcSpec<TEntityRenderer>;
    readonly subComponents?: IGraphicsSubComponents<TEntityRenderer, TUpdateArg, TEntityTraits>;
    /**
     * Instead of batching entities into update groups based on the subcomponents, update entities in turn cycling through
     * the subcomponents. With large shared buffers and few entities this can significantly improve performance.
     */
    readonly groupUpdatesByEntity?: boolean;

    initialize(entityRenderer: TEntityRenderer): void;

    /**
     * Invariant by entity for a given frame, called either once or entity count times before update, depending
     * on update strategy.
     */
    onBeforeUpdate
    (
        entityRenderer: TEntityRenderer,
        updateArg: TUpdateArg,
    )
        : void;

    /**
     * Called once per entity per frame.
     */
    update
    (
        entity: TEntityTraits,
        entityRenderer: TEntityRenderer,
        updateParameter: TUpdateArg,
    )
        : void;
}