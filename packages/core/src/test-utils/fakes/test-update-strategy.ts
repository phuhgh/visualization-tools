import { IPlotUpdateStrategy } from "../../update/i-plot-update-strategy";
import { IEntityGroup } from "../../entities/groups/a-entity-group";
import { _Production } from "rc-js-util";
import { TestGroup } from "./test-group";

/**
 * @internal
 */
export class TestUpdateStrategy implements IPlotUpdateStrategy<IEntityGroup<unknown, unknown>>
{
    public updateGroup: IEntityGroup<unknown, unknown> = new TestGroup();

    public update(): void
    {
        _Production.error("not implemented");
    }
}