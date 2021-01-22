import { ICartesian2dUpdateArg } from "../update/cartesian2d-update-arg";
import { IGlCartesian2dCameraBinder } from "../camera/gl-cartesian2d-camera-binder";
import { IGlIndexedPoint2dBinder } from "../indexed-point-2d/i-gl-indexed-point2d-binder";
import { Mat3, Once } from "rc-js-util";
import { TInterleavedPoint2dTrait } from "../traits/t-interleaved-point2d-trait";
import { GlBuffer, GlFloatAttribute, GlMat3Uniform, GlProgramSpecification, GlShader, IGlAttribute, IGlProgramSpec, IGraphicsComponentSpecification, mat2MultiplyValueShader, TGl2EntityRenderer } from "@visualization-tools/core";

/**
 * @public
 * Draws points of varying sizes and colors.
 */
export class GlPointGraphicsComponent
    implements IGraphicsComponentSpecification<TGl2EntityRenderer, ICartesian2dUpdateArg<Float32Array>, TInterleavedPoint2dTrait<Float32Array>>
{
    public specification: IGlProgramSpec;

    public constructor
    (
        private readonly cameraBinder: IGlCartesian2dCameraBinder,
        private readonly pointBinder: IGlIndexedPoint2dBinder<Float32Array>,
    )
    {
        this.specification = this.getSpec();
        this.bindings = this.getBindings();
    }

    @Once
    public getCacheId(): string
    {
        return [
            "Point",
            this.cameraBinder.getCacheId(),
            this.pointBinder.getCacheId(),
        ].join("_");
    }

    public initialize(entityRenderer: TGl2EntityRenderer): void
    {
        this.pointBinder.initialize(entityRenderer);
        this.cameraBinder.initialize(entityRenderer);
        this.bindings.circleGeometryAttribute.initialize(entityRenderer);
        this.bindings.canvasToClipSizeUniform.initialize(entityRenderer);
    }

    public onBeforeUpdate(entityRenderer: TGl2EntityRenderer, updateArg: ICartesian2dUpdateArg<Float32Array>): void
    {
        this.bindings.circleGeometryAttribute.bind(entityRenderer);
        this.bindings.canvasToClipSizeUniform.setData(updateArg.canvasDimensions.pixelToClipSize);
        this.bindings.canvasToClipSizeUniform.bind(entityRenderer);
    }

    public update
    (
        entity: TInterleavedPoint2dTrait<Float32Array>,
        entityRenderer: TGl2EntityRenderer,
        updateArg: ICartesian2dUpdateArg<Float32Array>,
    )
        : void
    {
        this.pointBinder.updateInstanced(entity, entityRenderer, 1);
        this.pointBinder.overrideColors(entityRenderer, entity);

        this.cameraBinder.setZ(entity);
        this.cameraBinder.update(updateArg.drawTransforms, entityRenderer);

        // draw
        entityRenderer.drawInstancedArrays(entityRenderer.context.TRIANGLE_FAN, 0, this.outerVertices + 1, entity.data.getLength());
    }

    private static generateCircleGeometry(vertexCount: number): Float32Array
    {
        // using index therefore not 2 pi
        const increment = Math.PI / (vertexCount - 1);
        const end = vertexCount * 2 + 2;
        const vertexes = new Float32Array(end);

        for (let i = 2; i < end; i += 2)
        {
            const step = increment * i;
            vertexes[i] = Math.cos(step);
            vertexes[i + 1] = Math.sin(step);
        }

        return vertexes;
    }

    private getSpec()
    {
        return GlProgramSpecification.mergeProgramSpecifications([
            this.cameraBinder.specification,
            this.pointBinder.specification,
            new GlProgramSpecification(
                GlShader.combineShaders([
                    mat2MultiplyValueShader,
                    vertexShaderPartial,
                ]),
                fragmentShaderSource,
                ["ANGLE_instanced_arrays"],
            ),
        ]);
    }

    private getBindings(): IGlPointBindings
    {
        const geometry = GlPointGraphicsComponent.generateCircleGeometry(this.outerVertices);

        return {
            circleGeometryAttribute: new GlFloatAttribute("pointGc_position", new GlBuffer(geometry), 2),
            canvasToClipSizeUniform: new GlMat3Uniform("pointGc_canvasToClipSize", new Mat3.f32()),
        };
    }

    private readonly outerVertices = 40;
    private readonly bindings: IGlPointBindings;
}

interface IGlPointBindings
{
    circleGeometryAttribute: IGlAttribute;
    canvasToClipSizeUniform: GlMat3Uniform;
}

// language=GLSL prefix="#if __VERSION__ >=300 && __VERSION__ < 400 \n #define ATTRIBUTE in \n #define VARYING out \n #else \n #define ATTRIBUTE attribute \n #define VARYING varying \n #endif"
const vertexShaderPartial = new GlShader
(
    // @formatter:off
    `
ATTRIBUTE lowp vec2 pointGc_position;
uniform highp mat3 pointGc_canvasToClipSize;
VARYING lowp vec4 pointGc_color;

vec2 pointGc_getOffset()
{
    return mat3MultiplyVec2(pointGc_canvasToClipSize, pointGc_position * pointConnector_getSize()) * 0.5;
}

void main()
{
    vec3 position = v_2dCamera_getClipspaceCoords2d(pointConnector_getPosition());
    gl_Position = vec4(pointGc_getOffset() + position.xy, position.z, 1);
    pointGc_color = pointConnector_getColor();
}
`,
    // @formatter:on
);

// language=GLSL prefix="#if __VERSION__ >=300 && __VERSION__ < 400 \n #define VARYING in \n #define TEXTURE2D texture \n #else \n #define VARYING varying \n #define TEXTURE2D texture2D \n #endif \n void setFragmentColor(in lowp vec4 color);"
const fragmentShaderSource = new GlShader
(
    // @formatter:off
    `
VARYING highp vec4 pointGc_color;

void main()
{
    setFragmentColor(pointGc_color);
}
`,
    // @formatter:on
);