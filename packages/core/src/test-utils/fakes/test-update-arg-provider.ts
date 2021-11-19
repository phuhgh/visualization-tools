import { IEntityUpdateArgProvider } from "../../entities/i-entity-update-arg-provider";
import { _Production } from "rc-js-util";
import { IPlotRange } from "../../plot/i-plot-range";

/**
 * @internal
 */
export class TestUpdateArgProvider implements IEntityUpdateArgProvider<IPlotRange, unknown, unknown>
{
    public getUpdateArg(): unknown
    {
        _Production.error("not implemented");
    }
}