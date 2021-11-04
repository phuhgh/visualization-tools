import { TUnknownComponentRenderer } from "../t-unknown-component-renderer";
import { ITransformProvider } from "./i-transform-provider";
import { _Identifier } from "rc-js-util";

/**
 * @public
 */
export class NoTransformProvider implements ITransformProvider<TUnknownComponentRenderer, unknown, unknown>
{
    readonly groupId = _Identifier.getNextIncrementingId();
    readonly transformComponent = null;

    public getTransformBinder(): null
    {
        return null;
    }

    public updateTransform(): void
    {
        // no action needed
    }

    public setOutputBuffers(): void
    {
        // no action needed
    }

    public setGroupId(_groupId: number): void
    {
        // change is not permissible
    }
}
