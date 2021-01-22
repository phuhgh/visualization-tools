import { IIdentifierFactory, IReadonlyRange2d, Range2d, TTypedArray, TTypedArrayCtor } from "rc-js-util";

/**
 * @public
 * Trace provider for cartesian 2d. Update should be called every time the data range changes.
 */
export interface ICartesian2dTraceEntityConnector<TArray extends TTypedArray>
{
    readonly dataRange: IReadonlyRange2d<TArray>;

    /**
     * @returns new ChangeId.
     */
    update(dataRange: IReadonlyRange2d<TArray>): number;

    getXTick(index: number): number;
    getYTick(index: number): number;

    getTraceCount(): number;
    getXTraceCount(): number;
    getYTraceCount(): number;
}

/**
 * @public
 * Generates traces in increments of 2, 5 or 10 in order to fit within maxTraceCount. The actual trace count may be
 * up to maxTraceCount + 1.
 */
export class Cartesian2dTraceEntityConnector<TCtor extends TTypedArrayCtor>
    implements ICartesian2dTraceEntityConnector<InstanceType<TCtor>>
{
    public dataRange: IReadonlyRange2d<InstanceType<TCtor>>;

    public constructor
    (
        rangeCtor: TCtor,
        private readonly maxTraceCount: number,
        private readonly changeIdGenerator: IIdentifierFactory,
    )
    {
        this.dataRange = Range2d.getCtor(rangeCtor).factory.createOneEmpty();
    }

    public update(dataRange: IReadonlyRange2d<InstanceType<TCtor>>): number
    {
        this.dataRange = dataRange;
        const xTickSize = this.getTickSize(dataRange.getXRange());
        const yTickSize = this.getTickSize(dataRange.getYRange());

        this.xStart = Cartesian2dTraceEntityConnector.getStart(dataRange.getXMin(), xTickSize);
        this.yStart = Cartesian2dTraceEntityConnector.getStart(dataRange.getYMin(), yTickSize);
        this.xCount = Cartesian2dTraceEntityConnector.getCount(this.xStart, xTickSize, dataRange.getXMax());
        this.yCount = Cartesian2dTraceEntityConnector.getCount(this.yStart, yTickSize, dataRange.getYMax());

        this.xStep = xTickSize;
        this.yStep = yTickSize;

        return this.changeIdGenerator.getNextId();
    }

    public getXTick(index: number): number
    {
        return this.xStart + this.xStep * index;
    }

    public getYTick(index: number): number
    {
        return this.yStart + this.yStep * index;
    }

    public getTraceCount(): number
    {
        return this.xCount + this.yCount;
    }

    public getXTraceCount(): number
    {
        return this.xCount;
    }

    public getYTraceCount(): number
    {
        return this.yCount;
    }

    private getTickSize(range: number): number
    {
        const exponent = Math.round(Math.log10(range));
        let tickSize = Math.pow(10, exponent - 1);
        // tickSize may not be representable exactly,
        // round to avoid float funnies
        const ticksInRange = Math.round(range / tickSize);

        if (ticksInRange <= this.maxTraceCount)
        {
            // no action needed
        }
        else if (ticksInRange * 0.5 <= this.maxTraceCount)
        {
            tickSize *= 2;
        }
        else if (ticksInRange * 0.2 <= this.maxTraceCount)
        {
            tickSize *= 5;
        }
        else
        {
            tickSize *= 10;
        }

        return tickSize;
    }

    private static getStart(min: number, tickSize: number): number
    {
        const firstTick = ((min / tickSize) | 0) * tickSize;

        if (firstTick < min)
        {
            return firstTick + tickSize;
        }
        else
        {
            return firstTick;
        }
    }

    private static getCount(start: number, tickSize: number, end: number): number
    {
        return 1 + ((end - start) / tickSize) | 0;
    }

    private xStart: number = 0;
    private xStep: number = 0;
    private yStart: number = 0;
    private yStep: number = 0;
    private xCount: number = 0;
    private yCount: number = 0;
}
