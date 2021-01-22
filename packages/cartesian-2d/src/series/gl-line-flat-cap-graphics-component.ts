import { IGlCartesian2dCameraBinder } from "../camera/gl-cartesian2d-camera-binder";
import { ICartesian2dUpdateArg } from "../update/cartesian2d-update-arg";
import { _Debug, Mat3, Once } from "rc-js-util";
import { IGlIndexedPoint2dBinder } from "../indexed-point-2d/i-gl-indexed-point2d-binder";
import { TInterleavedPoint2dTrait } from "../traits/t-interleaved-point2d-trait";
import { generate2LinedNormalShader, GlBuffer, GlFloatAttribute, GlMat3Uniform, GlProgramSpecification, GlShader, IGlProgramSpec, IGraphicsComponentSpecification, mat3MultiplyVec2Shader, TGl2EntityRenderer } from "@visualization-tools/core";

/**
 * @public
 * Draws line caps, to be used with {@link GlCaplessLineGraphicsComponent}. Handles sizes and colors per point.
 */
export class GlLineFlatCapGraphicsComponent
    implements IGraphicsComponentSpecification<TGl2EntityRenderer, ICartesian2dUpdateArg<Float32Array>, TInterleavedPoint2dTrait<Float32Array>>
{
    public specification: IGlProgramSpec;

    public constructor
    (
        private readonly cameraBinder: IGlCartesian2dCameraBinder,
        private readonly indexedDataBinder: IGlIndexedPoint2dBinder<Float32Array>,
    )
    {
        DEBUG_MODE && _Debug.assert(indexedDataBinder.pointsBound === 3, "requires 3 point binder");
        this.specification = GlProgramSpecification.mergeProgramSpecifications([
            cameraBinder.specification,
            indexedDataBinder.specification,
            caplessProgramSpecification,
        ]);
        this.bindings = GlLineFlatCapGraphicsComponent.getBindings();
    }

    @Once
    public getCacheId(): string
    {
        return [
            "GlFlatCapLine",
            this.cameraBinder.getCacheId(),
            this.indexedDataBinder.getCacheId(),
        ].join("_");
    }

    public initialize(entityRenderer: TGl2EntityRenderer): void
    {
        this.cameraBinder.initialize(entityRenderer);
        this.indexedDataBinder.initialize(entityRenderer);
        this.bindings.capGeometryAttribute.initialize(entityRenderer);
        this.bindings.canvasToClipUniform.initialize(entityRenderer);
    }

    public onBeforeUpdate(entityRenderer: TGl2EntityRenderer, updateArg: ICartesian2dUpdateArg<Float32Array>): void
    {
        this.bindings.capGeometryAttribute.bind(entityRenderer, entityRenderer.context.STATIC_DRAW);
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
        const length = entity.data.getLength();

        if (length < 3)
        {
            // nothing to draw
            return;
        }

        this.cameraBinder.setZ(entity);
        this.cameraBinder.update(updateArg.drawTransforms, entityRenderer);

        // draw 1st set
        this.indexedDataBinder.updateInstanced(entity, entityRenderer, 1);
        this.indexedDataBinder.overrideColors(entityRenderer, entity);

        entityRenderer.drawInstancedArrays(
            entityRenderer.context.TRIANGLE_STRIP,
            0,
            4,
            (length * 0.3333333333333333) | 0,
        );

        const startIndex = entity.data.getStart();

        // draw 2nd set
        this.indexedDataBinder.setPointers(startIndex + 1, entity.data.getBlockByteSize());
        this.indexedDataBinder.bindInstanced(entityRenderer, 1);
        entityRenderer.drawInstancedArrays(
            entityRenderer.context.TRIANGLE_STRIP,
            0,
            4,
            ((length - 1) * 0.3333333333333333) | 0,
        );

        // draw 3nd set
        this.indexedDataBinder.updatePointers(entity);
        this.indexedDataBinder.setPointers(startIndex + 2, entity.data.getBlockByteSize());
        this.indexedDataBinder.bindInstanced(entityRenderer, 1);

        entityRenderer.drawInstancedArrays(
            entityRenderer.context.TRIANGLE_STRIP,
            0,
            4,
            ((length - 2) * 0.3333333333333333) | 0,
        );
    }

    private static getBindings(): ICaplessLineStripBindings
    {
        const trianglePosition = new GlFloatAttribute(
            "caplessLine_trianglePosition",
            new GlBuffer(new Float32Array([
                1, 0,
                0, 0,
                1, 1,
                0, 1,
            ])),
            2,
        );

        return {
            capGeometryAttribute: trianglePosition,
            canvasToClipUniform: new GlMat3Uniform("caplessLine_canvasToClipSize", new Mat3.f32()),
        };
    }

    private bindings: ICaplessLineStripBindings;
}

interface ICaplessLineStripBindings
{
    capGeometryAttribute: GlFloatAttribute;
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

vec2 caplessLine_getAdjustedPoistion(vec2 p1, vec2 p2, vec2 p3, float p2Size)
{
    vec2 l1Normal = generate2dLineNormal(p1, p2, vec2(1));
    vec2 l2Normal = generate2dLineNormal(p2, p3, vec2(1));
    vec2 normal = mix(l2Normal, l1Normal, caplessLine_trianglePosition.y);

    float xSign = caplessLine_trianglePosition.x * 2. - 1.;
    vec2 pixelWidthOffset = xSign * p2Size * normal;

    return p2 + mat3MultiplyVec2(caplessLine_canvasToClipSize, pixelWidthOffset);
}

void main()
{
    vec3 p1 = v_2dCamera_getClipspaceCoords2d(pointConnector_getPosition());
    vec3 p2 = v_2dCamera_getClipspaceCoords2d(pointConnector_getPosition1());
    vec3 p3 = v_2dCamera_getClipspaceCoords2d(pointConnector_getPosition2());
    float p2Size =  pointConnector_getSize1() * 0.5;

    gl_Position = vec4(caplessLine_getAdjustedPoistion(p1.xy, p2.xy, p3.xy, p2Size), p1.z, 1);
    
    vec4 p2Color = pointConnector_getColor1();
    caplessLine_lineColor = p2Color;
}
`,
    // @formatter:on
);

// language=GLSL prefix="#if __VERSION__ >=300 && __VERSION__ < 400 \n #define VARYING in \n #define TEXTURE2D texture \n #else \n #define VARYING varying \n #define TEXTURE2D texture2D \n #endif \n void setFragmentColor(in lowp vec4 color);"
const fragmentShaderSource = new GlShader
(
    // @formatter:off
    `
    VARYING highp vec4 caplessLine_lineColor;

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