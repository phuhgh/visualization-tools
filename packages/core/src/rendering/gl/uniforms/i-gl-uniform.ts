import { TGlBasicComponentRenderer } from "../component-renderer/t-gl-basic-component-renderer";

/**
 * @public
 */
export interface IGlUniform
{
    onContextLost(): void;
    initialize(componentRenderer: TGlBasicComponentRenderer): void;
    bind(renderer: TGlBasicComponentRenderer): void;
}