/**
 * @public
 * Used for dirty checking of entity state.
 */
export type TChangeTrackedTrait = {
    changeId: number,
    updateChangeId(): void,
};