import { IRandomNumberGenerator, Range2d, RgbaColorPacker, TTypedArray, Vec2 } from "rc-js-util";
import { generateLinearPointSizes } from "./generate-linear-point-sizes";
import { generateLinearRGBRange } from "./generate-linear-r-g-b-range";
import { ISharedInterleavedConnector } from "@visualization-tools/core";
import { IDrawablePoint2dOffsets } from "@visualization-tools/cartesian-2d";
import { generateCircleGeometry } from "./generate-cricle-geometry";

export function populateTestData
(
    connector: ISharedInterleavedConnector<TTypedArray, IDrawablePoint2dOffsets>,
    range: Range2d<TTypedArray>,
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