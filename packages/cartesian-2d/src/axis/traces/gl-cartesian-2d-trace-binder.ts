import { Mat4, Vec4 } from "rc-js-util";
import { TTrace2dBindingsTrait } from "../../traits/t-trace2d-bindings-trait";
import { TTraceEntity } from "./t-trace-entity";
import { AGlInstancedBinder, GlBuffer, GlFloatAttribute, GlMat4Uniform, GlProgramSpecification, GlShader, IGlAttribute, IGlInstancedBinder, IGlProgramSpec, TGlInstancedEntityRenderer } from "@visualization-tools/core";

/**
 * @public
 * An entity that draws traces in cartesian 2d plot.
 */
export type TGlTraceEntity =
    & TTraceEntity<Float32Array>
    & TTrace2dBindingsTrait
    ;

/**
 * @public
 * Binds trace data to WebGL buffers.
 */
export interface IGlTraceBinder
    extends IGlInstancedBinder<TGlTraceEntity, TGlInstancedEntityRenderer>
{
}

/**
 * @public
 * {@inheritDoc IGlTraceBinder}
 */
export class GlCartesian2dTraceBinder
    extends AGlInstancedBinder<TGlTraceEntity, TGlInstancedEntityRenderer>
    implements IGlTraceBinder
{
    public specification: IGlProgramSpec = new GlProgramSpecification
    (
        vertex,
        fragmentShader,
    );

    public constructor()
    {
        super();
        this.bindings = {
            positionAttribute: new GlFloatAttribute("traceConnector_position", new GlBuffer(null), 4),
            configUniform: new GlMat4Uniform("traceConnector_config", this.config),
        };
    }

    public getCacheId(): string
    {
        return "GlTrace";
    }

    public mergeBuffers(binders: GlCartesian2dTraceBinder[]): void
    {
        const pointBuffer = GlFloatAttribute.extractBuffer(this.bindings.positionAttribute);

        for (let i = 0, iEnd = binders.length; i < iEnd; ++i)
        {
            GlFloatAttribute.setBuffer(binders[i].bindings.positionAttribute, pointBuffer);
        }
    }

    public initialize(entityRenderer: TGlInstancedEntityRenderer): void
    {
        this.bindings.positionAttribute.initialize(entityRenderer);
        this.bindings.configUniform.initialize(entityRenderer);
    }

    public updateData(entity: TGlTraceEntity): void
    {
        this.bindings.positionAttribute.setData(entity.graphicsSettings.traces, entity.changeId);
        this.config.setRow(1, this.colorCache.setRGBAColor(entity.graphicsSettings.traceColor, true));
        this.config[0] = entity.graphicsSettings.traceLinePixelSize;
    }

    public updatePointers(): void
    {
        // static pointers
    }

    public bindUniforms(entityRenderer: TGlInstancedEntityRenderer): void
    {
        this.bindings.configUniform.bind(entityRenderer);
    }

    public bindAttributes(entityRenderer: TGlInstancedEntityRenderer): void
    {
        this.bindings.positionAttribute.bind(entityRenderer);
    }

    public bindInstanced
    (
        entityRenderer: TGlInstancedEntityRenderer,
        divisor: number,
        usage?: GLenum,
    )
        : void
    {
        this.bindings.positionAttribute.bindInstanced(entityRenderer, divisor, usage);
    }

    private readonly bindings: {
        // vec4, defines both ends of the trace
        positionAttribute: IGlAttribute;
        configUniform: GlMat4Uniform;
    };
    // pixel size at 0, trace color on first row
    private readonly config = Mat4.f32.factory.createOneEmpty();
    private readonly colorCache = Vec4.f32.factory.createOneEmpty();
}

// @formatter:off
// language=GLSL prefix="#if __VERSION__ >=300 && __VERSION__ < 400 \n #define ATTRIBUTE in \n #define VARYING out \n #else \n #define ATTRIBUTE attribute \n #define VARYING varying \n #endif"
const vertex = new GlShader(`
ATTRIBUTE highp vec4 traceConnector_position;
uniform lowp mat4 traceConnector_config;

mat2 traceConnector_getPosition()
{
    return mat2(traceConnector_position);
}

float traceConnector_getWidth()
{
    return traceConnector_config[0][0];
}
`);
// @formatter:on


// language=GLSL prefix="#if __VERSION__ >=300 && __VERSION__ < 400 \n #define VARYING in \n #define TEXTURE2D texture \n #else \n #define VARYING varying \n #define TEXTURE2D texture2D \n #endif \n void setFragmentColor(in lowp vec4 color);"
const fragmentShader = new GlShader(`
uniform lowp mat4 traceConnector_config;

lowp vec4 traceConnector_getColor()
{
    return traceConnector_config[1];
}
`);
