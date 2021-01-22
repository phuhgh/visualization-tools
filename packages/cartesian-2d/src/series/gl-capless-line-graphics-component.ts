import { IGlCartesian2dCameraBinder } from "../camera/gl-cartesian2d-camera-binder";
import { ICartesian2dUpdateArg } from "../update/cartesian2d-update-arg";
import { _Debug, Mat3, Once } from "rc-js-util";
import { IGlIndexedPoint2dBinder } from "../indexed-point-2d/i-gl-indexed-point2d-binder";
import { TInterleavedPoint2dTrait } from "../traits/t-interleaved-point2d-trait";
import { generate2LinedNormalShader, GlBuffer, GlFloatAttribute, GlMat3Uniform, GlProgramSpecification, GlShader, IGlProgramSpec, IGraphicsComponentSpecification, mat3MultiplyVec2Shader, TGl2EntityRenderer } from "@visualization-tools/core";

/**
 * @public
 * Draws lines without caps without generating any intermediate geometry. Caps can be added by combining with a cap drawing component.
 * Handles sizes and colors per point.
 */
export class GlCaplessLineGraphicsComponent
    implements IGraphicsComponentSpecification<TGl2EntityRenderer, ICartesian2dUpdateArg<Float32Array>, TInterleavedPoint2dTrait<Float32Array>>
{
    public specification: IGlProgramSpec;

    public constructor
    (
        private readonly cameraBinder: IGlCartesian2dCameraBinder,
        private readonly indexedDataBinder: IGlIndexedPoint2dBinder<Float32Array>,
    )
    {
        DEBUG_MODE && _Debug.assert(indexedDataBinder.pointsBound === 2, "requires 2 point binder");
        this.specification = GlProgramSpecification.mergeProgramSpecifications([
            cameraBinder.specification,
            indexedDataBinder.specification,
            caplessProgramSpecification,
        ]);
        this.bindings = GlCaplessLineGraphicsComponent.getBindings();
    }

    @Once
    public getCacheId(): string
    {
        return [
            "CaplessLine",
            this.cameraBinder.getCacheId(),
            this.indexedDataBinder.getCacheId(),
        ].join("_");
    }

    public initialize(entityRenderer: TGl2EntityRenderer): void
    {
        this.cameraBinder.initialize(entityRenderer);
        this.indexedDataBinder.initialize(entityRenderer);
        this.bindings.trianglePositionAttribute.initialize(entityRenderer);
        this.bindings.canvasToClipUniform.initialize(entityRenderer);
    }

    public onBeforeUpdate(entityRenderer: TGl2EntityRenderer, updateArg: ICartesian2dUpdateArg<Float32Array>): void
    {
        this.bindings.trianglePositionAttribute.bind(entityRenderer, entityRenderer.context.STATIC_DRAW);
        this.bindings.canvasToClipUniform.setData(updateArg.canvasDimensions.pixelToClipSize);
        this.bindings.canvasToClipUniform.bind(entityRenderer);
    }

    public update
    (
        entity: TInterleavedPoint2dTrait<Float32Array>,
        entityRenderer: TGl2EntityRenderer,
        updateArg: ICartesian2dUpdateArg<Float32Array>,
    )
        : void
    {
        if (entity.data.getLength() < 2)
        {
            // nothing to draw
            return;
        }

        this.cameraBinder.setZ(entity);
        this.cameraBinder.update(updateArg.drawTransforms, entityRenderer);

        // draw odds
        this.indexedDataBinder.updateInstanced(entity, entityRenderer, 1);
        this.indexedDataBinder.overrideColors(entityRenderer, entity);

        entityRenderer.drawInstancedArrays(
            entityRenderer.context.TRIANGLE_STRIP,
            0,
            4,
            (entity.data.getLength() * 0.5) | 0,
        );

        // draw evens
        this.indexedDataBinder.setPointers(entity.data.getStart() + 1, entity.data.getBlockByteSize());
        this.indexedDataBinder.bindInstanced(entityRenderer, 1);
        entityRenderer.drawInstancedArrays(
            entityRenderer.context.TRIANGLE_STRIP,
            0,
            4,
            ((entity.data.getLength() - 1) * 0.5) | 0,
        );
    }

    private static getBindings(): ICaplessLineStripBindings
    {
        const trianglePosition = new GlFloatAttribute(
            "caplessLine_trianglePosition",
            new GlBuffer(new Float32Array([
                0, 0,
                1, 0,
                0, 1,
                1, 1,
            ])),
            2,
        );

        return {
            trianglePositionAttribute: trianglePosition,
            canvasToClipUniform: new GlMat3Uniform("caplessLine_canvasToClipSize", new Mat3.f32()),
        };
    }

    private bindings: ICaplessLineStripBindings;
}

interface ICaplessLineStripBindings
{
    trianglePositionAttribute: GlFloatAttribute;
    canvasToClipUniform: GlMat3Uniform;
}


// language=GLSL prefix="#if __VERSION__ >=300 && __VERSION__ < 400 \n #define ATTRIBUTE in \n #define VARYING out \n #else \n #define ATTRIBUTE attribute \n #define VARYING varying \n #endif"
const vertexShaderPartial = new GlShader
(
    // @formatter:off
    `
/* === capless line === */
ATTRIBUTE lowp vec2 caplessLine_trianglePosition;
uniform highp mat3 caplessLine_canvasToClipSize;
VARYING lowp vec4 caplessLine_lineColor;

float caplessLine_getSize(vec2 sizes)
{
    return mix(sizes[0], sizes[1], caplessLine_trianglePosition.y);
}

vec2 caplessLine_getAdjustedPoistion(vec2 p1, vec2 p2, vec2 sizes)
{
    vec2 normal = generate2dLineNormal(p1, p2, vec2(1));
    vec2 position = mix(p1, p2, caplessLine_trianglePosition.y);

    float xSign = caplessLine_trianglePosition.x * 2. - 1.;
    vec2 pixelWidthOffset = xSign * caplessLine_getSize(sizes) * normal;

    return position + mat3MultiplyVec2(caplessLine_canvasToClipSize, pixelWidthOffset);
}

vec4 caplessLine_getColor(vec4 p1Color, vec4 p2Color)
{
    return mix(p1Color, p2Color, caplessLine_trianglePosition.y);
}

void main()
{
    vec3 p1 = v_2dCamera_getClipspaceCoords2d(pointConnector_getPosition());
    vec3 p2 = v_2dCamera_getClipspaceCoords2d(pointConnector_getPosition1());
    vec2 sizes = vec2(pointConnector_getSize(), pointConnector_getSize1()) * 0.5;

    gl_Position = vec4(caplessLine_getAdjustedPoistion(p1.xy, p2.xy, sizes), p1.z, 1);
    
    vec4 p1Color = pointConnector_getColor();
    vec4 p2Color = pointConnector_getColor1();
    caplessLine_lineColor = caplessLine_getColor(p1Color, p2Color);
}
`,
    // @formatter:on
);

// language=GLSL prefix="#if __VERSION__ >=300 && __VERSION__ < 400 \n #define VARYING in \n #define TEXTURE2D texture \n #else \n #define VARYING varying \n #define TEXTURE2D texture2D \n #endif \n void setFragmentColor(in lowp vec4 color);"
const fragmentShaderSource = new GlShader
(
    // @formatter:off
    `
VARYING lowp vec4 caplessLine_lineColor;

void main()
{
    setFragmentColor(caplessLine_lineColor);
}
`,
    // @formatter:on
);

const caplessProgramSpecification = new GlProgramSpecification(
    GlShader.combineShaders([
        generate2LinedNormalShader,
        mat3MultiplyVec2Shader,
        vertexShaderPartial,
    ]),
    fragmentShaderSource,
    ["ANGLE_instanced_arrays"],
);