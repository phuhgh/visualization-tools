import { dummyGlProgramSpecification, GlProgramSpecification, GlShader, GlTransformComponentFactory, GlTransformFeedback, GlVec2Uniform, IGlProgramSpec, IGlTransformComponent, TGl2ComponentRenderer } from "@visualization-tools/core";
import { TInterleavedPoint2dTrait } from "../../traits/t-interleaved-point2d-trait";
import { _Debug, Once, Vec2 } from "rc-js-util";
import { IGlIndexedPoint2dBinder, IndexedPoint2dIdentifier } from "../../indexed-point-2d/i-gl-indexed-point2d-binder";
import { ICartesian2dUpdateArg } from "../update-arg/cartesian2d-update-arg";
import { point2dNaturalLogTransformShader } from "./point2d-natural-log-transform-shader";
import { Cartesian2dNaturalLogTransform } from "./cartesian2d-natural-log-transform";
import { getTransformChangeId } from "./get-transform-change-id";

/**
 * @public
 * Applies natural log to an indexable gl connector. The behavior of the transform is undefined if any point is less than 0.
 */
export class GlPoint2dNaturalLogTransform
    implements IGlTransformComponent<TGl2ComponentRenderer, IGlIndexedPoint2dBinder<Float32Array>, ICartesian2dUpdateArg<Float32Array>, unknown>
{
    public static factory = new GlTransformComponentFactory(Cartesian2dNaturalLogTransform.transformId, IndexedPoint2dIdentifier, GlPoint2dNaturalLogTransform);
    public readonly specification: IGlProgramSpec;

    public constructor
    (
        private point2dBinder: IGlIndexedPoint2dBinder<Float32Array>,
    )
    {
        this.specification = GlProgramSpecification.mergeProgramSpecifications([
            this.point2dBinder.specification,
            new GlProgramSpecification(
                GlShader.combineShaders([
                    point2dNaturalLogTransformShader,
                    transformShader,
                ]),
                dummyGlProgramSpecification.fragmentShader,
            ),
        ]);
    }

    @Once
    public getCacheId(): string
    {
        return [
            "logFeedbackTransform",
            this.point2dBinder.getTransformId(),
        ].join("_");
    }

    public initialize(transformRenderer: TGl2ComponentRenderer): void
    {
        this.point2dBinder.initialize(transformRenderer);
        this.bindings.feedbackTransform.initialize(transformRenderer);
        this.bindings.configUniform.initialize(transformRenderer);
    }

    public setOutputBuffers
    (
        entity: TInterleavedPoint2dTrait<Float32Array>,
        binder: IGlIndexedPoint2dBinder<Float32Array>,
        transformRenderer: TGl2ComponentRenderer,
    )
        : void
    {
        DEBUG_MODE && _Debug.assert(this.point2dBinder.binderClassificationId === binder.binderClassificationId, "attempted to transform inappropriate binder");
        this.bindings.feedbackTransform.bind(transformRenderer);
        this.point2dBinder.swapBuffers(binder);
        this.point2dBinder.setResultBuffers(entity, binder, transformRenderer, transformRenderer.context.STREAM_DRAW);
    }

    public performTransform
    (
        entity: TInterleavedPoint2dTrait<Float32Array>,
        transformRenderer: TGl2ComponentRenderer,
        updateArg: ICartesian2dUpdateArg<Float32Array>,
    )
        : void
    {
        const ctx = transformRenderer.context;

        this.config[0] = Number(updateArg.userTransform.xTransformEnabled);
        this.config[1] = Number(updateArg.userTransform.yTransformEnabled);
        this.bindings.configUniform.setData(this.config, transformRenderer.sharedState.frameCounter);
        this.bindings.configUniform.bind(transformRenderer);

        this.bindings.feedbackTransform.beginTransform(transformRenderer);
        this.point2dBinder.update(entity, transformRenderer, getTransformChangeId(entity));
        ctx.drawArrays(ctx.POINTS, entity.data.getStart(), entity.data.getLength());
        this.bindings.feedbackTransform.endTransform(transformRenderer);
        this.point2dBinder.clearResultBuffers(transformRenderer);
    }

    private config = new Vec2.f32();
    private bindings: IBindings = {
        feedbackTransform: new GlTransformFeedback(),
        configUniform: new GlVec2Uniform("point2dNaturalLogTransform_config", this.config),
    };
}

interface IBindings
{
    feedbackTransform: GlTransformFeedback;
    configUniform: GlVec2Uniform;
}

const transformShader = new GlShader(
    `
uniform vec2 point2dNaturalLogTransform_config;
void main()
{
    pointConnector_copyAllOutputs();
    pointConnector_setPosition(point2dNaturalLogTransform(pointConnector_getPosition(), point2dNaturalLogTransform_config));
}
`,
    300,
);

