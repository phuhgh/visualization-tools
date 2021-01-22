import { Mat3, Once } from "rc-js-util";
import { IGlTraceBinder, TGlTraceEntity } from "./gl-cartesian-2d-trace-binder";
import { ICartesian2dUpdateArg } from "../../update/cartesian2d-update-arg";
import { IGlCartesian2dCameraBinder } from "../../camera/gl-cartesian2d-camera-binder";
import { GlBuffer, GlFloatAttribute, GlMat3Uniform, GlProgramSpecification, GlShader, IGlProgramSpec, IGraphicsComponentSpecification, mat3MultiplyVec2Shader, TGlInstancedEntityRenderer } from "@visualization-tools/core";

/**
 * @public
 * Draws traces for cartesian 2d plots.
 */
export class GlCartesian2dTraceGraphicsComponent
    implements IGraphicsComponentSpecification<TGlInstancedEntityRenderer, ICartesian2dUpdateArg<Float32Array>, TGlTraceEntity>
{
    public specification: IGlProgramSpec;

    public constructor
    (
        private readonly traceBinder: IGlTraceBinder,
        private readonly cameraBinder: IGlCartesian2dCameraBinder,
    )
    {
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
                new GlBuffer(new Float32Array([
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
        return ["GlTraceGraphicsComponent", this.traceBinder.getCacheId()].join("_");
    }

    public initialize(entityRenderer: TGlInstancedEntityRenderer): void
    {
        this.traceBinder.initialize(entityRenderer);
        this.cameraBinder.initialize(entityRenderer);
        this.bindings.lineGeometryAttribute.initialize(entityRenderer);
        this.bindings.screenToClipSizeUniform.initialize(entityRenderer);
    }

    public onBeforeUpdate(entityRenderer: TGlInstancedEntityRenderer, updateArg: ICartesian2dUpdateArg<Float32Array>): void
    {
        this.bindings.lineGeometryAttribute.bind(entityRenderer, entityRenderer.context.STATIC_DRAW);
        this.bindings.screenToClipSizeUniform.setData(updateArg.canvasDimensions.pixelToClipSize);
        this.bindings.screenToClipSizeUniform.bind(entityRenderer);
    }

    public update
    (
        entity: TGlTraceEntity,
        entityRenderer: TGlInstancedEntityRenderer,
        updateArg: ICartesian2dUpdateArg<Float32Array>,
    )
        : void
    {
        // update dependencies
        this.cameraBinder.setZ(entity);
        this.cameraBinder.update(updateArg.drawTransforms, entityRenderer);
        this.traceBinder.updateInstanced(entity, entityRenderer, 1);

        // draw
        entityRenderer.drawInstancedArrays(entityRenderer.context.TRIANGLE_STRIP, 0, 4, entity.data.getTraceCount());
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
