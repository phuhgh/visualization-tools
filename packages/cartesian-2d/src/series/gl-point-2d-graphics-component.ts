import { IGlIndexedPoint2dBinder, IndexedPoint2dIdentifier } from "../indexed-point-2d/i-gl-indexed-point2d-binder";
import { _Debug, Mat3, Once } from "rc-js-util";
import { TInterleavedPoint2dTrait } from "../traits/t-interleaved-point2d-trait";
import { assertBinder, EGraphicsComponentType, GlFloatAttribute, GlFloatBuffer, GlMat3Uniform, GlProgramSpecification, GlShader, GlTransformProvider, IGlAttribute, IGlProgramSpec, ILinkableGraphicsComponent, IUpdateArg, mat2MultiplyValueShader, TGl2ComponentRenderer } from "@visualization-tools/core";
import { IGlCamera2dBinder } from "../camera/i-gl-camera2d-binder";

/**
 * @public
 * Draws points of varying sizes and colors.
 */
export class GlPoint2dGraphicsComponent<TUpdateArg extends IUpdateArg>
    implements ILinkableGraphicsComponent<TGl2ComponentRenderer, TUpdateArg, TInterleavedPoint2dTrait<Float32Array>>
{
    public readonly type = EGraphicsComponentType.Entity;
    public specification: IGlProgramSpec;
    public transform: GlTransformProvider<TGl2ComponentRenderer, IGlIndexedPoint2dBinder<Float32Array>, IGlIndexedPoint2dBinder<Float32Array>, TUpdateArg, TInterleavedPoint2dTrait<Float32Array>>;

    public constructor
    (
        private readonly cameraBinder: IGlCamera2dBinder<unknown, TUpdateArg>,
        private readonly indexedBinder: IGlIndexedPoint2dBinder<Float32Array>,
    )
    {
        DEBUG_MODE && _Debug.runBlock(() =>
        {
            assertBinder(indexedBinder, IndexedPoint2dIdentifier);
            _Debug.assert(indexedBinder.pointsBound === 1, "requires 1 point to be bound");
        });

        this.specification = this.getSpec();
        this.bindings = this.getBindings();
        this.transform = new GlTransformProvider(this, this.indexedBinder, (updateArg) => updateArg.userTransform);
    }

    @Once
    public getCacheId(): string
    {
        return [
            "Point",
            this.cameraBinder.getBinderId(),
            this.indexedBinder.getBinderId(),
        ].join("_");
    }

    public getLinkableBinders(): readonly IGlIndexedPoint2dBinder<Float32Array>[]
    {
        return [this.indexedBinder];
    }

    public initialize(componentRenderer: TGl2ComponentRenderer): void
    {
        this.indexedBinder.initialize(componentRenderer);
        this.cameraBinder.initialize(componentRenderer);
        this.bindings.circleGeometryAttribute.initialize(componentRenderer);
        this.bindings.canvasToClipSizeUniform.initialize(componentRenderer);
    }

    public onBeforeUpdate(componentRenderer: TGl2ComponentRenderer, updateArg: TUpdateArg): void
    {
        this.bindings.circleGeometryAttribute.bindArray(componentRenderer);
        const frameId = componentRenderer.sharedState.frameCounter;
        this.bindings.canvasToClipSizeUniform.setData(updateArg.canvasDimensions.pixelToClipSize, frameId);
        this.bindings.canvasToClipSizeUniform.bind(componentRenderer);
    }

    public update
    (
        entity: TInterleavedPoint2dTrait<Float32Array>,
        componentRenderer: TGl2ComponentRenderer,
        updateArg: TUpdateArg,
    )
        : void
    {
        this.indexedBinder.updateInstanced(entity, componentRenderer, entity.changeId, 1);
        this.indexedBinder.overrideColors(componentRenderer, entity, entity.changeId);

        this.cameraBinder.setZ(entity);
        this.cameraBinder.update(this.cameraBinder.getBinderData(updateArg), componentRenderer, componentRenderer.sharedState.frameCounter);

        // draw
        componentRenderer.drawInstancedArrays(componentRenderer.context.TRIANGLE_FAN, 0, this.outerVertices + 1, entity.data.getLength());
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
            this.indexedBinder.specification,
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
        const geometry = GlPoint2dGraphicsComponent.generateCircleGeometry(this.outerVertices);

        return {
            circleGeometryAttribute: new GlFloatAttribute("pointGc_position", new GlFloatBuffer(geometry), 2),
            canvasToClipSizeUniform: new GlMat3Uniform("pointGc_canvasToClipSize", new Mat3.f32()),
        };
    }

    private readonly outerVertices = 40;
    private readonly bindings: IGlPointBindings;
}

interface IGlPointBindings
{
    circleGeometryAttribute: IGlAttribute<Float32Array>;
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