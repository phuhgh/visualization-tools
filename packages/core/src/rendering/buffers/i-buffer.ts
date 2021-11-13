/**
 * @public
 */
export interface IBuffer
{
    /**
     * Resets the state of the buffer, such as dirty check ids. If the buffer was initialized it does not require
     * reinitialization.
     */
    resetState(): void;
}