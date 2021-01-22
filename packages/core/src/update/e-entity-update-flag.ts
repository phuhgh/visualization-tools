/**
 * @public
 * Flags to indicate required state changes when entities change. Can be combined by bitwise OR.
 */
export enum EEntityUpdateFlag
{
    NoUpdateRequired = 0,
    DrawRequired = 1 << 0,
    InteractionHandlerUpdateRequired = 1 << 1,
    UpdateAllRequired = DrawRequired | InteractionHandlerUpdateRequired,
}