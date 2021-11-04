import { Mat3, Once } from "rc-js-util";
import { IGlTraceBinder, TraceBinderIdentifier } from "./gl-cartesian-2d-trace-binder";
import { ICartesian2dUpdateArg } from "../../update/update-arg/cartesian2d-update-arg";
import { IGlCartesian2dCameraBinder } from "../../camera/gl-cartesian2d-camera-binder";
import { assertBinder, EGraphicsComponentType, GlFloatAttribute, GlFloatBuffer, GlMat3Uniform, GlProgramSpecification, GlShader, GlTransformProvider, IGlProgramSpec, ILinkableBinder, ILinkableGraphicsComponent, mat3MultiplyVec2Shader, TGl2ComponentRenderer, TGlInstancedComponentRenderer } from "@visualization-tools/core";
import { TGlTraceEntity } from "./t-gl-trace-entity";
import { IGlTraceTransformBinder } from "./i-gl-cartesian2d-trace-transform-binder";

/**
 * @public
 * Draws traces for cartesian 2d plots.
 */
export class GlCartesian2dTraceGraphicsComponent
    implements ILinkableGraphicsComponent<TGlInstancedComponentRenderer, ICartesian2dUpdateArg<Float32Array>, TGlTraceEntity>
{
    public readonly type = EGraphicsComponentType.Entity;
    public specification: IGlProgramSpec;
    public transform: GlTransformProvider<TGl2ComponentRenderer, IGlTraceTransformBinder, IGlTraceBinder, ICartesian2dUpdateArg<Float32Array>, TGlTraceEntity>;

    public constructor
    (
        private readonly traceBinder: IGlTraceBinder,
        private readonly cameraBinder: IGlCartesian2dCameraBinder,
    )
    {
        DEBUG_MODE && assertBinder(traceBinder, TraceBinderIdentifier);
        this.transform = new GlTransformProvider(this, this.traceBinder, (updateArg) => updateArg.userTransform);
        this.specification = GlProgramSpecification.mergeProgramSpecifications([
            traceBinder.specification,
            cameraBinder.specification,
            new GlProgramSpecification(
                GlShader.combineShaders([
                    mat3MultiplyVec2Shader,
                    vertexShaderPartial,
                ]),
                fragmentShader,
                ["ANGLE_instanced_arrays"],
            ),
        ]);
        this.bindings = {
            // 0 min, 1 is max index
            lineGeometryAttribute: new GlFloatAttribute(
                "traceGc_lineGeometry",
                new GlFloatBuffer(new Float32Array([
                    0, 0,
                    1, 0,
                    0, 1,
                    1, 1,
                ])),
                2,
            ),
            screenToClipSizeUniform: new GlMat3Uniform("traceGc_screenToClipSize", new Mat3.f32()),
        };
    }

    @Once
    public getCacheId(): string
    {
        return [
            "GlTraceGraphicsComponent",
            this.cameraBinder.getBinderId(),
            this.traceBinder.getBinderId(),
        ].join("_");
    }

    public getLinkableBinders(): readonly ILinkableBinder<TGlInstancedComponentRenderer>[]
    {
        return [this.traceBinder];
    }

    public initialize(componentRenderer: TGlInstancedComponentRenderer): void
    {
        this.traceBinder.initialize(componentRenderer);
        this.cameraBinder.initialize(componentRenderer);
        this.bindings.lineGeometryAttribute.initialize(componentRenderer);
        this.bindings.screenToClipSizeUniform.initialize(componentRenderer);
    }

    public onBeforeUpdate(componentRenderer: TGlInstancedComponentRenderer, updateArg: ICartesian2dUpdateArg<Float32Array>): void
    {
        this.bindings.lineGeometryAttribute.bindArray(componentRenderer, componentRenderer.context.STATIC_DRAW);
        const frameId = componentRenderer.sharedState.frameCounter;
        this.bindings.screenToClipSizeUniform.setData(updateArg.canvasDimensions.pixelToClipSize, frameId);
        this.bindings.screenToClipSizeUniform.bind(componentRenderer);
    }

    public update
    (
        entity: TGlTraceEntity,
        componentRenderer: TGlInstancedComponentRenderer,
        updateArg: ICartesian2dUpdateArg<Float32Array>,
    )
        : void
    {
        // update dependencies
        this.cameraBinder.setZ(entity);
        this.cameraBinder.update(updateArg.drawTransforms, componentRenderer, componentRenderer.sharedState.frameCounter);
        this.traceBinder.updateInstanced(entity, componentRenderer, entity.changeId, 1);

        // draw
        componentRenderer.drawInstancedArrays(componentRenderer.context.TRIANGLE_STRIP, 0, 4, entity.data.getTraceCount());
    }

    private bindings: IGlTraceBindings;
}

interface IGlTraceBindings
{
    lineGeometryAttribute: GlFloatAttribute;
    screenToClipSizeUniform: GlMat3Uniform;
}

// language=GLSL prefix="#if __VERSION__ >=300 && __VERSION__ < 400 \n #define ATTRIBUTE in \n #define VARYING out \n #else \n #define ATTRIBUTE attribute \n #define VARYING varying \n #endif"
const vertexShaderPartial = new GlShader
(
    // @formatter:off
    `
ATTRIBUTE lowp vec2 traceGc_lineGeometry;
uniform highp mat3 traceGc_screenToClipSize;

vec2 traceGc_getWidth(float width, vec2 rangeSign, vec2 trianglePosition)
{
    vec2 widthOffset = width * rangeSign.yx * (trianglePosition - 0.5);

    return mat3MultiplyVec2(traceGc_screenToClipSize, widthOffset);
}

// tracePosition [xMin, yMin, xMax, yMax]
vec3 traceGc_getPosition(mat2 tracePosition, float width, vec2 trianglePosition)
{
    vec2 min = tracePosition[0];
    vec2 range = tracePosition[1] - min;
    vec3 basePosition = v_2dCamera_getClipspaceCoords2d(range * trianglePosition + min);
    return basePosition + vec3(traceGc_getWidth(width, sign(range), trianglePosition), 0);
}

void main()
{
    vec3 position = traceGc_getPosition(traceConnector_getPosition(), traceConnector_getWidth(), traceGc_lineGeometry);
    gl_Position = vec4(position, 1);
}
`,
    // @formatter:on
);

// language=GLSL prefix="#if __VERSION__ >=300 && __VERSION__ < 400 \n #define VARYING in \n #define TEXTURE2D texture \n #else \n #define VARYING varying \n #define TEXTURE2D texture2D \n #endif \n void setFragmentColor(in lowp vec4 color);"
const fragmentShader = new GlShader(`
void main()
{
    setFragmentColor(traceConnector_getColor());
}
`);
