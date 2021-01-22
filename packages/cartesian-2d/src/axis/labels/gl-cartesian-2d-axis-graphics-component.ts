import { Cartesian2dAxisLabelGenerator } from "./cartesian-2d-axis-label-generator";
import { TTrace2dBindingsTrait } from "../../traits/t-trace2d-bindings-trait";
import { Mat2, Mat3 } from "rc-js-util";
import { TAxisLabelEntity } from "./t-axis-label-entity";
import { ICartesian2dUpdateArg } from "../../update/cartesian2d-update-arg";
import { IGlTraceBinder } from "../traces/gl-cartesian-2d-trace-binder";
import { IGlCartesian2dCameraBinder } from "../../camera/gl-cartesian2d-camera-binder";
import { GlBuffer, GlFloatAttribute, GlMat2Uniform, GlMat3Uniform, GlProgramSpecification, GlShader, GlTexture2d, IGlProgramSpec, IGraphAttachPoint, IGraphicsComponentSpecification, mat3MultiplyVec2Shader, SpriteLookup, TGl2EntityRenderer } from "@visualization-tools/core";

/**
 * @public
 * WebGL entity that draws axis labels.
 */
export type TGlAxisEntity =
    & TAxisLabelEntity<Float32Array>
    & TTrace2dBindingsTrait
    ;

/**
 * @public
 * Draws labels for cartesian 2d plots.
 */
export class GlCartesian2dAxisGraphicsComponent
    implements IGraphicsComponentSpecification<TGl2EntityRenderer, ICartesian2dUpdateArg<Float32Array>, TGlAxisEntity>
{
    public specification: IGlProgramSpec;

    public constructor
    (
        attachPoint: IGraphAttachPoint,
        private readonly traceBinder: IGlTraceBinder,
        private readonly cameraBinder: IGlCartesian2dCameraBinder,
        private readonly axisLabelGenerator: Cartesian2dAxisLabelGenerator = new Cartesian2dAxisLabelGenerator(attachPoint),
    )
    {
        this.specification = GlProgramSpecification.mergeProgramSpecifications([
            traceBinder.specification,
            cameraBinder.specification,
            new GlProgramSpecification(
                GlShader.combineShaders([
                    mat3MultiplyVec2Shader,
                    vertexShader,
                ]),
                fragmentShader,
            )]);
    }

    public getCacheId(): string
    {
        return "GlAxisGraphicsComponent";
    }

    public initialize(entityRenderer: TGl2EntityRenderer): void
    {
        this.cameraBinder.initialize(entityRenderer);
        this.traceBinder.initialize(entityRenderer);

        this.bindings.canvasToClipSizeUniform.initialize(entityRenderer);
        this.bindings.configUniform.initialize(entityRenderer);
        this.bindings.textureMappingAttribute.initialize(entityRenderer);
        this.bindings.spriteGeometryAttribute.initialize(entityRenderer);
        this.bindings.labelSpriteTexture2d.initialize(entityRenderer);
    }

    public onBeforeUpdate
    (
        entityRenderer: TGl2EntityRenderer,
        updateArg: ICartesian2dUpdateArg<Float32Array>,
    )
        : void
    {
        this.bindings.spriteGeometryAttribute.bind(entityRenderer);
        this.bindings.canvasToClipSizeUniform.setData(updateArg.canvasDimensions.pixelToClipSize);
        this.bindings.canvasToClipSizeUniform.bind(entityRenderer);
    }

    public update
    (
        entity: TGlAxisEntity,
        entityRenderer: TGl2EntityRenderer,
        updateArg: ICartesian2dUpdateArg<Float32Array>,
    )
        : void
    {
        this.cameraBinder.setZ(entity);
        this.cameraBinder.update(updateArg.drawTransforms, entityRenderer);

        this.traceBinder.updateData(entity);
        this.traceBinder.bindInstanced(entityRenderer, 1);

        const spriteLookup = this.axisLabelGenerator.update(entity, updateArg.canvasDimensions.dpr);
        this.bindings.textureMappingAttribute.setData(SpriteLookup.toTypedArray(spriteLookup), entity.changeId);
        this.bindings.textureMappingAttribute.bindInstanced(entityRenderer, 1);

        const canvas = this.axisLabelGenerator.getCanvas();
        this.updateConfig(entity, canvas.width, canvas.height);
        this.bindings.configUniform.bind(entityRenderer);

        this.bindings.labelSpriteTexture2d.updateData(canvas);
        this.bindings.labelSpriteTexture2d.bind(entityRenderer);

        entityRenderer.drawInstancedArrays(entityRenderer.context.TRIANGLE_STRIP, 0, 4, entity.data.getTraceCount());
    }

    private updateConfig(entity: TGlAxisEntity, textureWidth: number, textureHeight: number): void
    {
        this.config[0] = entity.graphicsSettings.axisOptions.padding;
        this.config[1] = entity.graphicsSettings.axisOptions.padding;
        this.config[2] = 1 / textureWidth;
        this.config[3] = 1 / textureHeight;
    }

    private config = new Mat2.f32();
    private bindings: IAxisBindings = {
        textureMappingAttribute: new GlFloatAttribute("axisGc_texMapping", new GlBuffer(null), 4),
        spriteGeometryAttribute: new GlFloatAttribute("axisGc_spriteGeometry", new GlBuffer(
                new Float32Array([
                    0, 0,
                    1, 0,
                    0, 1,
                    1, 1,
                ])),
            2,
        ),
        configUniform: new GlMat2Uniform("axisGc_config", this.config),
        canvasToClipSizeUniform: new GlMat3Uniform("traceGc_screenToClipSize", new Mat3.f32()),
        labelSpriteTexture2d: new GlTexture2d("axisGc_texture", null),
    };
}

interface IAxisBindings
{
    textureMappingAttribute: GlFloatAttribute;
    spriteGeometryAttribute: GlFloatAttribute;
    configUniform: GlMat2Uniform;
    canvasToClipSizeUniform: GlMat3Uniform;
    labelSpriteTexture2d: GlTexture2d;
}

// @formatter:off
// language=GLSL prefix="#if __VERSION__ >=300 && __VERSION__ < 400 \n #define ATTRIBUTE in \n #define VARYING out \n #else \n #define ATTRIBUTE attribute \n #define VARYING varying \n #endif"
const vertexShader = new GlShader(`

ATTRIBUTE mediump vec4 axisGc_texMapping;
ATTRIBUTE lowp vec2 axisGc_spriteGeometry;
uniform mediump mat2 axisGc_config;
uniform highp mat3 traceGc_screenToClipSize;
VARYING mediump vec2 axisGc_texCoord;

vec2 axisGc_getTexDims()
{
    return axisGc_texMapping.zw;
}

vec2 axisGc_getTexOffset()
{
    return axisGc_texMapping.xy;
}

vec2 axisGc_getPadding()
{
    return axisGc_config[0];
}

vec2 axisGc_getTexScaleFactor()
{
    return axisGc_config[1];
}

vec2 axisGc_getTexCoord()
{
    float invertedY = mix(1., 0., axisGc_spriteGeometry.y);
    vec2 texPos = axisGc_getTexOffset() + axisGc_getTexDims() * vec2(axisGc_spriteGeometry.x, invertedY);
    return texPos * axisGc_getTexScaleFactor();
}

vec4 getPosition()
{
    vec2 near = traceConnector_getPosition()[0];
    vec2 far = traceConnector_getPosition()[1];
    vec3 nearTrace = v_2dCamera_getClipspaceCoords2d(near);

    vec2 offsetDir = sign(near - far);
    vec2 adjustedDimensions = mat3MultiplyVec2(traceGc_screenToClipSize, axisGc_getTexDims() * 0.5);
    adjustedDimensions = mix(-adjustedDimensions, adjustedDimensions, axisGc_spriteGeometry) + offsetDir * adjustedDimensions;
    vec2 labelPadding = mat3MultiplyVec2(traceGc_screenToClipSize, axisGc_getPadding()) * offsetDir.xy;

    return vec4(nearTrace.xy + adjustedDimensions + labelPadding, nearTrace.z, 1);
}

void main()
{
    vec2 texCoord = axisGc_getTexCoord();
    axisGc_texCoord = texCoord;
    gl_Position = getPosition();
}`);

// language=GLSL prefix="#if __VERSION__ >=300 && __VERSION__ < 400 \n #define VARYING in \n #define TEXTURE2D texture \n #else \n #define VARYING varying \n #define TEXTURE2D texture2D \n #endif \n void setFragmentColor(in lowp vec4 color);"
const fragmentShader = new GlShader(`
uniform highp sampler2D axisGc_texture;
VARYING mediump vec2 axisGc_texCoord;

void main()
{
    setFragmentColor(TEXTURE2D(axisGc_texture, axisGc_texCoord));
}`,
);
// @formatter:on