import { IChartUpdateOptions } from "../update/i-chart-update-options";
import { IChangeDetectionConfig } from "./i-change-detection-config";
import { IChartWideInteractionOptions } from "../templating/i-chart-wide-interaction-options";
import { IIdentifierFactory, IncrementingIdentifierFactory } from "rc-js-util";

/**
 * @public
 * Construction config for {@link IChartComponent}.
 */
export interface IChartConfig
{
    readonly interactionOptions: IChartWideInteractionOptions;
    readonly changeDetectionConfig: IChangeDetectionConfig;
    readonly updateOptions: IChartUpdateOptions;
    readonly changeIdFactory: IIdentifierFactory;
}

/**
 * @public
 * {@inheritDoc IChartConfig}
 */
export class ChartConfig implements IChartConfig
{
    public readonly interactionOptions: IChartWideInteractionOptions = { disableLongPressContext: true, scrollZooms: true, disableAllInteraction: false };
    public readonly updateOptions: IChartUpdateOptions = { updateDimsOnDraw: true, updateAllPlotsOnDraw: false, interactionRollupTime: 500 };
    public readonly changeDetectionConfig: IChangeDetectionConfig = noChangeDetectionConfig;
    public readonly changeIdFactory: IIdentifierFactory = new IncrementingIdentifierFactory();

    constructor
    (
        overrides?: Partial<IChartConfig>,
    )
    {
        Object.assign(this, overrides);
    }
}

const noChangeDetectionConfig: IChangeDetectionConfig = {
    runOutsideOfChangeDetection: (cb: () => void) => cb(),
    runInsideOfChangeDetection: (cb: () => void) => cb(),
};