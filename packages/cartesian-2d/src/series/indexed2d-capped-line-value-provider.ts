import { IReadonlyMat2, IReadonlyMat3, TF64Vec2, TTypedArray } from "rc-js-util";
import { ICanvasCappedLineValueProvider } from "./canvas-variable-width-capped-line";
import { ICartesian2dUserTransform } from "../update/user-transforms/i-cartesian2d-user-transform";
import { TInterleavedPoint2dTrait } from "../traits/t-interleaved-point2d-trait";

/**
 * @internal
 */
export class Indexed2dCappedLineValueProvider<TArray extends TTypedArray> implements ICanvasCappedLineValueProvider
{
    public fallbackColor: number = 0;

    public update
    (
        entity: TInterleavedPoint2dTrait<TTypedArray>,
        screenTransform: IReadonlyMat3<TArray>,
        sizeTransform: IReadonlyMat2<TArray>,
        userTransform: ICartesian2dUserTransform<TArray>,
    )
        : void
    {
        this.fallbackColor = entity.graphicsSettings.pointDisplay.packedColor;
        this.screenTransform = screenTransform;
        this.sizeTransform = sizeTransform;
        this.userTransform = userTransform;
    }

    public getSize(size: number): number
    {
        return this.sizeTransform.getVec2MultiplyX(size) * 0.5;
    }

    public setPosition(toSet: TF64Vec2, x: number, y: number): void
    {
        toSet.update(
            this.screenTransform.getVec3MultiplyX(this.userTransform.forwardX(x)),
            this.screenTransform.getVec3MultiplyY(this.userTransform.forwardY(y)),
        );
    }

    private sizeTransform!: IReadonlyMat2<TArray>;
    private screenTransform!: IReadonlyMat3<TArray>;
    private userTransform!: ICartesian2dUserTransform<TArray>;
}