/**
 * @public
 */
export interface IQuadTreeTargetOptions
{
    /**
     * When the quad tree is being updated, how long can the UI thread be blocked for? This is tracked per entity, if a
     * single entity takes longer than this it will not be paused until after that entity is finished.
     */
    yieldTime: number;
}