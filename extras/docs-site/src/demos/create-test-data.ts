import { IRandomNumberGenerator, IReadonlyRange2d, RgbaColorPacker, TTypedArray, Vec2 } from "rc-js-util";
import { ISharedInterleavedConnector } from "@visualization-tools/core";
import { IDrawablePoint2dOffsets } from "@visualization-tools/cartesian-2d";
import { generateCircleGeometry, generateLinearPointSizes, generateLinearRGBRange } from "@visualization-tools/test-data";

export function createTestData<TArray extends TTypedArray>
(
    connector: ISharedInterleavedConnector<TArray, IDrawablePoint2dOffsets>,
    range: IReadonlyRange2d<TArray>,
    alpha: number,
    rnd: IRandomNumberGenerator,
)
    : void
{
    generateCircleGeometry(connector, range, rnd);

    if (connector.offsets.size != null)
    {
        generateLinearPointSizes(Vec2.f32.factory.createOne(1, 100), connector, connector.offsets.size);
    }

    if (connector.offsets.color != null)
    {
        generateLinearRGBRange(
            RgbaColorPacker.packColor(rnd.getNext() * 255, rnd.getNext() * 255, 0, alpha),
            RgbaColorPacker.packColor(0, rnd.getNext() * 255, rnd.getNext() * 255, alpha),
            connector,
            connector.offsets.color,
        );
    }
}