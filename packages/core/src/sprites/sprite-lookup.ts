/**
 * @public
 * Store for sprite positions.
 */
export abstract class SpriteLookup
{
    [index: number]: number;

    /**
     * The number of sprites multiplied by 4 (x, y, w, h).
     */
    public abstract length: number;

    public static createOne(imageCount: number): SpriteLookup
    {
        return new Float32Array(imageCount * 4) as unknown as SpriteLookup;
    }

    public static toTypedArray(lookup: SpriteLookup): Float32Array
    {
        return lookup as unknown as Float32Array;
    }

    public static setSpriteAtIndex(this: void, sprite: SpriteLookup, index: number, x: number, y: number, width: number, height: number): void
    {
        index *= 4;
        sprite[index] = x;
        sprite[index + 1] = y;
        sprite[index + 2] = width;
        sprite[index + 3] = height;
    }

    public static getXAtIndex(this: void, sprite: SpriteLookup, imageIndex: number): number
    {
        return sprite[imageIndex * 4];
    }

    public static getYAtIndex(this: void, sprite: SpriteLookup, imageIndex: number): number
    {
        return sprite[imageIndex * 4 + 1];
    }

    public static getWidthAtIndex(this: void, sprite: SpriteLookup, imageIndex: number): number
    {
        return sprite[imageIndex * 4 + 2];
    }

    public static getHeightAtIndex(this: void, sprite: SpriteLookup, imageIndex: number): number
    {
        return sprite[imageIndex * 4 + 3];
    }
}