import { TUnknownComponentRenderer } from "../t-unknown-component-renderer";
import { TExtractGcSpec } from "../component-renderer/t-extract-gc-spec";
import { ICacheable } from "../i-cacheable";

/**
 * @public
 * The minimum specification of a graphics component such that {@link IComponentRendererFactory} can generate entity renderers.
 */
export interface IGraphicsComponentSpecification<TComponentRenderer extends TUnknownComponentRenderer>
    extends ICacheable
{
    readonly specification: TExtractGcSpec<TComponentRenderer>;
    initialize(componentRenderer: TComponentRenderer): void;
}
