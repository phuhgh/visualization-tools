import { IPlotConstructionOptions } from "../../plot/i-plot-construction-options";
import { IEntityGroup } from "../../entities/groups/a-entity-group";
import { TestGroup } from "./test-group";
import { IPlotUpdateStrategy } from "../../update/i-plot-update-strategy";
import { TestUpdateStrategy } from "./test-update-strategy";
import { _Fp, Range2d, TF32Range2d } from "rc-js-util";
import { ITestPlotRange } from "./i-test-plot-range";

/**
 * @internal
 */
export function getTestGlOptions
(
    plotRange: TF32Range2d = Range2d.f32.factory.createOne(-2, 2, -2, 2),
    plotPosition: TF32Range2d = Range2d.f32.factory.createOne(-1, 0, -1, 0),
)
    : IPlotConstructionOptions<ITestPlotRange<Float32Array>, IEntityGroup<unknown, unknown>, unknown>
{
    return {
        plotRange: { range: plotRange, isDirty: false, update: _Fp.noOp },
        plotPosition: plotPosition,
        updateGroup: new TestGroup(),
        createUpdateStrategy(): IPlotUpdateStrategy<IEntityGroup<unknown, unknown>>
        {
            return new TestUpdateStrategy();
        },
    };
}
