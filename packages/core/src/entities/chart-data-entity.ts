import { IDataTrait } from "./traits/i-data-trait";
import { IGraphicsComponentSettingsTrait } from "./traits/i-graphics-component-settings-trait";
import { _Fp, IIdentifierFactory } from "rc-js-util";
import { TChangeTrackedTrait } from "./traits/t-change-tracked-trait";
import { IHitTestableTrait } from "./groups/i-hit-testable-trait";
import { EHoverState, IHoverableTrait } from "./traits/i-hoverable-trait";
import { IClickableTrait } from "./traits/i-clickable-trait";
import { IDraggableTrait } from "./traits/i-draggable-trait";
import { IChartPointerEvent } from "../eventing/user-interaction/internal-events/chart-pointer-event";
import { EEntityUpdateFlag } from "../update/e-entity-update-flag";
import { IChartEntity } from "./chart-entity";

/**
 * @public
 * An entity that represents a simple data entity. Use is not required, create a specific type as required.
 */
export class ChartDataEntity<TUpdateArg, TConnector, TGcSettings extends object>
    implements IDataTrait<TConnector>,
               IGraphicsComponentSettingsTrait<TGcSettings>,
               IHitTestableTrait,
               TChangeTrackedTrait,
               IHoverableTrait,
               IClickableTrait,
               IDraggableTrait,
               IChartEntity<TUpdateArg>
{
    public groupMask = 0;
    // the hit test id is assigned by the hit test system
    public hitTestId = -1;
    public changeId: number;
    public isFiltered = false;

    public constructor
    (
        public data: TConnector,
        public graphicsSettings: TGcSettings,
        private changeIdFactory: IIdentifierFactory,
        private beforeUpdate: (updateArg: TUpdateArg) => void = _Fp.noOp,
    )
    {
        this.changeId = this.changeIdFactory.getNextId();
    }

    public onDragStart?(pointerEvent: IChartPointerEvent<MouseEvent>, segmentIds: Set<number>): boolean;

    public onDragEnd?(pointerEvent: IChartPointerEvent<MouseEvent>, segmentIds: Set<number>): void;

    public onClick?(pointerEvent: IChartPointerEvent<MouseEvent>, segmentIds: Set<number>): EEntityUpdateFlag;

    public onDblClick?(pointerEvent: IChartPointerEvent<MouseEvent>, segmentIds: Set<number>): EEntityUpdateFlag;

    public onHover?(state: EHoverState, segments: ReadonlySet<number>, pointerEvent: IChartPointerEvent<MouseEvent>): EEntityUpdateFlag;

    public onBeforeUpdate(updateArg: TUpdateArg): void
    {
        this.beforeUpdate(updateArg);
    }

    public updateChangeId(): void
    {
        this.changeId = this.changeIdFactory.getNextId();
    }
}
