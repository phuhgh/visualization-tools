import { _Array, IEmscriptenWrapper } from "rc-js-util";
import { HitAlwaysAllowedComponent } from "@visualization-tools/core";
import { Cartesian2dPlotSharedQuadTree, ICartesian2dBindings, T2dZIndexesTrait } from "@visualization-tools/cartesian-2d";
import { PointEntityCollection } from "./point-entity-collection";

export function configureEntityInteractionHandlers<TArrayCtor extends Float32ArrayConstructor | Float64ArrayConstructor>
(
    plotInteractionHandler: Cartesian2dPlotSharedQuadTree<InstanceType<TArrayCtor>, T2dZIndexesTrait>,
    emscriptenModule: IEmscriptenWrapper<ICartesian2dBindings>,
    dataEntities: PointEntityCollection<TArrayCtor, unknown>,
)
    : void
{
    const interleavedPointTester = {
        hitAllowedComponent: new HitAlwaysAllowedComponent(),
        hitTestComponent: dataEntities.hitTestComponent,
    };

    _Array.forEach(dataEntities.entities, (entity) =>
    {
        plotInteractionHandler.interactionGroups.clickable.addToGroup(entity, interleavedPointTester);
        plotInteractionHandler.interactionGroups.hoverable.addToGroup(entity, interleavedPointTester);
    });
}