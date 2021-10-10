import { dummyGlProgramSpecification, GlProgramSpecification, GlShader, GlTransformComponentFactory, GlTransformFeedback, GlVec2Uniform, IGlProgramSpec, IGlTransformComponent, TGl2ComponentRenderer } from "@visualization-tools/core";
import { _Debug, Once, Vec2 } from "rc-js-util";
import { ICartesian2dUpdateArg } from "../update-arg/cartesian2d-update-arg";
import { IGlTraceBinder, TraceBinderIdentifier } from "../../axis/traces/gl-cartesian-2d-trace-binder";
import { point2dNaturalLogTransformShader } from "./point2d-natural-log-transform-shader";
import { Cartesian2dNaturalLogTransform } from "./cartesian2d-natural-log-transform";
import { TGlTraceEntity } from "../../axis/traces/t-gl-trace-entity";
import { IGlTraceTransformBinder } from "../../axis/traces/i-gl-cartesian2d-trace-transform-binder";
import { getTransformChangeId } from "./get-transform-change-id";

/**
 * @public
 * Applies natural log to a trace gl connector. The behavior of the transform is undefined if the range is less than 0.
 */
export class GlTrace2dNaturalLogTransform
    implements IGlTransformComponent<TGl2ComponentRenderer, IGlTraceBinder, ICartesian2dUpdateArg<Float32Array>, unknown>
{
    public static factory = new GlTransformComponentFactory(Cartesian2dNaturalLogTransform.transformId, TraceBinderIdentifier, GlTrace2dNaturalLogTransform);
    public readonly specification: IGlProgramSpec;

    public constructor
    (
        private traceBinder: IGlTraceTransformBinder,
    )
    {
        this.specification = GlProgramSpecification.mergeProgramSpecifications([
            this.traceBinder.specification,
            new GlProgramSpecification(
                GlShader.combineShaders([
                    point2dNaturalLogTransformShader,
                    vertexShader,
                ]),
                dummyGlProgramSpecification.fragmentShader,
            ),
        ]);
    }

    @Once
    public getCacheId(): string
    {
        return [
            "trace2dLogTransform",
            this.traceBinder.getTransformId(),
        ].join("_");
    }

    public initialize(transformRenderer: TGl2ComponentRenderer): void
    {
        this.traceBinder.initialize(transformRenderer);
        this.bindings.feedbackTransform.initialize(transformRenderer);
        this.bindings.configUniform.initialize(transformRenderer);
    }

    public setOutputBuffers
    (
        entity: TGlTraceEntity,
        binder: IGlTraceBinder,
        transformRenderer: TGl2ComponentRenderer,
    )
        : void
    {
        DEBUG_MODE && _Debug.assert(this.traceBinder.binderClassificationId === binder.binderClassificationId, "attempted to transform inappropriate binder");
        this.bindings.feedbackTransform.bind(transformRenderer);
        this.traceBinder.swapBuffers(binder);
        this.traceBinder.setResultBuffers(entity, binder, transformRenderer, transformRenderer.context.STREAM_DRAW);
    }

    public performTransform
    (
        entity: TGlTraceEntity,
        transformRenderer: TGl2ComponentRenderer,
        updateArg: ICartesian2dUpdateArg<Float32Array>,
    )
        : void
    {
        this.config[0] = Number(updateArg.userTransform.xTransformEnabled);
        this.config[1] = Number(updateArg.userTransform.yTransformEnabled);
        this.bindings.configUniform.setData(this.config, transformRenderer.sharedState.frameCounter);
        this.bindings.configUniform.bind(transformRenderer);

        this.bindings.feedbackTransform.beginTransform(transformRenderer);
        this.traceBinder.update(entity, transformRenderer, getTransformChangeId(entity));
        transformRenderer.context.drawArrays(transformRenderer.context.POINTS, 0, entity.data.getTraceCount());
        this.bindings.feedbackTransform.endTransform(transformRenderer);
        this.traceBinder.clearResultBuffers(transformRenderer);
    }

    private config = new Vec2.f32();
    private bindings: IBindings = {
        feedbackTransform: new GlTransformFeedback(),
        configUniform: new GlVec2Uniform("traceNaturalLogTransform_config", this.config),
    };
}

interface IBindings
{
    feedbackTransform: GlTransformFeedback;
    configUniform: GlVec2Uniform;
}

// @formatter:off
// language=GLSL prefix="#if __VERSION__ >=300 && __VERSION__ < 400 \n #define ATTRIBUTE in \n #define VARYING out \n #else \n #define ATTRIBUTE attribute \n #define VARYING varying \n #endif"
const vertexShader = new GlShader(`
uniform vec2 traceNaturalLogTransform_config;

void main()
{
    mat2 position = traceConnector_getPosition();
    vec2 lowerPoint = point2dNaturalLogTransform(position[0], traceNaturalLogTransform_config);
    vec2 upperPoint = point2dNaturalLogTransform(position[1], traceNaturalLogTransform_config);

    traceConnector_setPosition(lowerPoint, upperPoint);
}
`,
    300);
// @formatter:on