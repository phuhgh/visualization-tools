import { TChangeTrackedTrait } from "./traits/t-change-tracked-trait";
import { IncrementingIdentifierFactory } from "rc-js-util";

/**
 * @public
 * Base chart entity.
 */
export interface IChartEntity<TUpdateArg>
    extends TChangeTrackedTrait
{
    onBeforeUpdate(updateArg: TUpdateArg): void;
}

/**
 * @public
 * {@inheritDoc IChartEntity}
 */
export class ChartEntity<TUpdateArg>
    implements IChartEntity<TUpdateArg>
{
    public changeId: number;

    public constructor
    (
        private readonly identifierFactory: IncrementingIdentifierFactory,
    )
    {
        this.changeId = this.identifierFactory.getNextId();
    }

    public onBeforeUpdate(): void
    {
        // no action
    }

    public updateChangeId(): void
    {
        this.changeId = this.identifierFactory.getNextId();
    }
}
