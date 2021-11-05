import { Cartesian2dAxisLabelGenerator } from "./cartesian-2d-axis-label-generator";
import { TTrace2dBindingsTrait } from "../../traits/t-trace2d-bindings-trait";
import { Mat2, Mat3, Once } from "rc-js-util";
import { TAxisLabelEntity } from "./t-axis-label-entity";
import { ICartesian2dUpdateArg } from "../../update/update-arg/cartesian2d-update-arg";
import { IGlTraceBinder, TraceBinderIdentifier } from "../traces/gl-cartesian-2d-trace-binder";
import { IGlCartesian2dCameraBinder } from "../../camera/gl-cartesian2d-camera-binder";
import { assertBinder, EGraphicsComponentType, GlFloatAttribute, GlFloatBuffer, GlMat2Uniform, GlMat3Uniform, GlProgramSpecification, GlShader, GlTexture2d, GlTransformProvider, IGlProgramSpec, IGraphAttachPoint, ILinkableBinder, ILinkableGraphicsComponent, mat3MultiplyVec2Shader, SpriteLookup, TGl2ComponentRenderer } from "@visualization-tools/core";
import { IGlTraceTransformBinder } from "../traces/i-gl-cartesian2d-trace-transform-binder";

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
    implements ILinkableGraphicsComponent<TGl2ComponentRenderer, ICartesian2dUpdateArg<Float32Array>, TGlAxisEntity>
{
    public readonly type = EGraphicsComponentType.Entity;
    public specification: IGlProgramSpec;
    public transform: GlTransformProvider<TGl2ComponentRenderer, IGlTraceTransformBinder, IGlTraceBinder, ICartesian2dUpdateArg<Float32Array>, TGlAxisEntity>;

    public constructor
    (
        attachPoint: IGraphAttachPoint,
        private readonly traceBinder: IGlTraceBinder,
        private readonly cameraBinder: IGlCartesian2dCameraBinder,
        private readonly axisLabelGenerator: Cartesian2dAxisLabelGenerator = new Cartesian2dAxisLabelGenerator(attachPoint),
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
                    vertexShader,
                ]),
                fragmentShader,
            )]);
    }

    @Once
    public getCacheId(): string
    {
        return [
            "GlAxisGraphicsComponent",
            this.cameraBinder.getBinderId(),
            this.traceBinder.getBinderId(),
        ].join("_");
    }

    public getLinkableBinders(): readonly ILinkableBinder<TGl2ComponentRenderer>[]
    {
        return [this.traceBinder];
    }

    public initialize(componentRenderer: TGl2ComponentRenderer): void
    {
        this.cameraBinder.initialize(componentRenderer);
        this.traceBinder.initialize(componentRenderer);

        this.bindings.canvasToClipSizeUniform.initialize(componentRenderer);
        this.bindings.configUniform.initialize(componentRenderer);
        this.bindings.textureMappingAttribute.initialize(componentRenderer);
        this.bindings.spriteGeometryAttribute.initialize(componentRenderer);
        this.bindings.labelSpriteTexture2d.initialize(componentRenderer);
    }

    public onBeforeUpdate
    (
        componentRenderer: TGl2ComponentRenderer,
        updateArg: ICartesian2dUpdateArg<Float32Array>,
    )
        : void
    {
        this.bindings.spriteGeometryAttribute.bindArray(componentRenderer);
        const frameId = componentRenderer.sharedState.frameCounter;
        this.bindings.canvasToClipSizeUniform.setData(updateArg.canvasDimensions.pixelToClipSize, frameId);
        this.bindings.canvasToClipSizeUniform.bind(componentRenderer);
    }

    public update
    (
        entity: TGlAxisEntity,
        componentRenderer: TGl2ComponentRenderer,
        updateArg: ICartesian2dUpdateArg<Float32Array>,
    )
        : void
    {
        this.cameraBinder.setZ(entity);
        this.cameraBinder.update(updateArg.drawTransforms, componentRenderer, componentRenderer.sharedState.frameCounter);

        this.traceBinder.updateData(entity, entity.changeId);
        this.traceBinder.bindInstanced(componentRenderer, 1);

        const spriteLookup = this.axisLabelGenerator.update(entity, updateArg.canvasDimensions.dpr);
        this.bindings.textureMappingAttribute.setData(SpriteLookup.toTypedArray(spriteLookup), entity.changeId);
        this.bindings.textureMappingAttribute.bindArrayInstanced(componentRenderer, 1);

        const canvas = this.axisLabelGenerator.getCanvas();
        this.updateConfig(entity, canvas.width, canvas.height, componentRenderer.sharedState.frameCounter);
        this.bindings.configUniform.bind(componentRenderer);

        this.bindings.labelSpriteTexture2d.updateData(canvas);
        this.bindings.labelSpriteTexture2d.bind(componentRenderer);

        componentRenderer.drawInstancedArrays(componentRenderer.context.TRIANGLE_STRIP, 0, 4, entity.data.getTraceCount());
    }

    private updateConfig(entity: TGlAxisEntity, textureWidth: number, textureHeight: number, frameId: number): void
    {
        this.config[0] = entity.graphicsSettings.axisOptions.padding;
        this.config[1] = entity.graphicsSettings.axisOptions.padding;
        this.config[2] = 1 / textureWidth;
        this.config[3] = 1 / textureHeight;
        this.bindings.configUniform.setData(this.config, frameId);
    }

    private config = new Mat2.f32();
    private bindings: IAxisBindings = {
        textureMappingAttribute: new GlFloatAttribute("axisGc_texMapping", new GlFloatBuffer(null), 4),
        spriteGeometryAttribute: new GlFloatAttribute("axisGc_spriteGeometry", new GlFloatBuffer(
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