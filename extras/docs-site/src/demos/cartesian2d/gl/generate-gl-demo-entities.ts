import { _Array, IEmscriptenWrapper, IIdentifierFactory, IReadonlyRange2d, Mulberry32Generator, Range1d, RgbaColorPacker } from "rc-js-util";
import { createTestData } from "../../create-test-data";
import { PointEntityCollection } from "../point-entity-collection";
import { TPointEntity } from "../t-point-entity";
import { ChartDataEntity, EEntityUpdateFlag, SharedInterleavedConnector } from "@visualization-tools/core";
import { hoverHighlightLineSegment, ICartesian2dBindings, Point2dDisplaySettings, Point2dSubcategory, SharedInterleavedLine2dHitTestComponent, TPoint2dSettings } from "@visualization-tools/cartesian-2d";

export function generateGlDemoEntities
(
    dataRange: IReadonlyRange2d<Float32Array>,
    emscriptenModule: IEmscriptenWrapper<ICartesian2dBindings>,
    changeIdFactory: IIdentifierFactory,
)
    : PointEntityCollection<Float32ArrayConstructor, TPointEntity<Float32ArrayConstructor>>
{
    const pointSubcategory = new Point2dSubcategory(Range1d.f32.factory.createOne(10, 20));
    const rnd = new Mulberry32Generator(79769);
    const interleavedConfig = { offsets: { x: 0, y: 1, size: 2, color: 3 }, blockElementCount: 4 };
    const settings: TPoint2dSettings<Float32Array>[] = _Array.mapRange(0, 24, () => ({
        pointDisplay: new Point2dDisplaySettings(
            1,
            RgbaColorPacker.packColor(255, 0, 0, 255),
            RgbaColorPacker.packColor(rnd.getNext() * 255, rnd.getNext() * 255, rnd.getNext() * 255, 0),
        ),
        pointSizeNormalizer: pointSubcategory.normalization,
        zIndexAbs: 0,
        zIndexRel: 0,
    }));

    const dataEntities = _Array.mapRange(0, 249, (index) =>
    {
        const someData = SharedInterleavedConnector.createOneF32(emscriptenModule, 1600, interleavedConfig);
        createTestData(someData, dataRange, 0, rnd);

        const entity = new ChartDataEntity(someData, settings[index * 0.1 | 0], changeIdFactory);
        entity.onHover = function (state, segments)
        {
            const groupStart = (index * 0.1 | 0) * 10;
            hoverHighlightLineSegment(this, state, segments);
            _Array.forEachRange(groupStart, groupStart + 9, (index) => dataEntities[index].updateChangeId());
            return EEntityUpdateFlag.DrawRequired;
        };

        return entity;
    });

    return new PointEntityCollection(
        dataEntities,
        pointSubcategory,
        SharedInterleavedLine2dHitTestComponent.createOne(emscriptenModule, Float32Array),
    );
}