/**
 * @public
 * If your application is using a change detection shim like Zone.js, you can improve performance by providing a custom
 * object. Refer to the library's documentation on how to do this.
 */
export interface IChangeDetectionConfig
{
    readonly runOutsideOfChangeDetection: (cb: () => void) => void;
    readonly runInsideOfChangeDetection: (cb: () => void) => void;
}