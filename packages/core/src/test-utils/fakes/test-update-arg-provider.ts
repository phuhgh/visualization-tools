import { IEntityUpdateArgProvider } from "../../entities/i-entity-update-arg-provider";
import { _Production } from "rc-js-util";

/**
 * @internal
 */
export class TestUpdateArgProvider implements IEntityUpdateArgProvider<unknown, unknown, unknown>
{
    public getUpdateArg(): unknown
    {
        _Production.error("not implemented");
    }
}