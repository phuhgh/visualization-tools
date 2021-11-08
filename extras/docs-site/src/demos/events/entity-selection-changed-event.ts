import { ADemoEvent } from "./a-demo-event";
import { EDemoEvent } from "./e-demo-event";

export interface IEntitySelectionChangedArg<TTrait>
{
    newSelection: ReadonlySet<TTrait>;
    addedEntities: readonly TTrait[];
    removedEntities: readonly TTrait[];
}

export class EntitySelectionChangedEvent<TTrait> extends ADemoEvent<IEntitySelectionChangedArg<TTrait>>
{
    public id = EDemoEvent.EntitySelectionChanged as const;

    public constructor
    (
        public arg: IEntitySelectionChangedArg<TTrait>,
    )
    {
        super();
    }
}