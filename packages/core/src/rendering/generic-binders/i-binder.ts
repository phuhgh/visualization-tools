import { TUnknownComponentRenderer } from "../t-unknown-component-renderer";

/**
 * @public
 * Base data binder, provides a key which indicates that it meets a specification for binding data in e.g. shaders.
 * This is used to match up transform components with an appropriate binder.
 */
export interface IBinder<TComponentRenderer extends TUnknownComponentRenderer>
{
    /**
     * The classification of binder, e.g. a binder of points in 2d.
     */
    readonly binderClassificationId: symbol;

    /**
     * A unique identifier for the program backing the binder.
     */
    getBinderId(): string;
    initialize(componentRenderer: TComponentRenderer): void;
}
