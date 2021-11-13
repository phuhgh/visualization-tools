import { Mat4, Vec4 } from "rc-js-util";
import { IGlTraceTransformBinder } from "./i-gl-cartesian2d-trace-transform-binder";
import { AGlInstancedBinder, BufferLayout, GlBuffer, GlFloatAttribute, GlFloatBuffer, GlMat4Uniform, GlProgramSpecification, GlShader, IGlAttribute, IGlInstancedBinder, IGlProgramSpec, ILinkableBinder, ITransformBinderProvider, TChangeTrackedTrait, TGl2ComponentRenderer, TGlF32BufferLayout, TGlInstancedComponentRenderer } from "@visualization-tools/core";
import { TGlTraceEntity } from "./t-gl-trace-entity";

/**
 * @public
 */
export const TraceBinderIdentifier = Symbol("trace binder");

/**
 * @public
 * Binds trace data to WebGL buffers.
 */
export interface IGlTraceBinder
    extends IGlInstancedBinder<TGlInstancedComponentRenderer, TGlTraceEntity, TGlF32BufferLayout>,
            ILinkableBinder<TGlInstancedComponentRenderer>,
            ITransformBinderProvider<IGlTraceTransformBinder>
{
    readonly bindsOutput: boolean;
}

/**
 * @public
 * {@inheritDoc IGlTraceBinder}
 */
export class GlCartesian2dTraceBinder
    extends AGlInstancedBinder<TGlInstancedComponentRenderer, TGlTraceEntity, TGlF32BufferLayout>
    implements IGlTraceBinder
{
    public specification: IGlProgramSpec;
    public binderClassificationId = TraceBinderIdentifier;
    public readonly linkId = linkId;

    public constructor
    (
        public readonly bindsOutput: boolean = false,
    )
    {
        super();
        this.bindings = {
            positionAttribute: new GlFloatAttribute("traceConnector_position", new GlFloatBuffer(null), 4),
            configUniform: new GlMat4Uniform("traceConnector_config", this.config),
        };
        this.specification = new GlProgramSpecification
        (
            GlShader.combineShaders([
                new GlShader(GlShader.getShaderFlag("TRACE_CONNECTOR_BINDS_OUTPUT", bindsOutput), bindsOutput ? 300 : undefined),
                vertex,
            ]),
            fragmentShader,
            [],
            [],
            bindsOutput ? ["traceConnector_outPosition"] : undefined,
        );
    }

    public getTransformBinder(): IGlTraceTransformBinder
    {
        return new GlCartesian2dTraceTransformBinder(true);
    }

    public getBinderId(): string
    {
        return "cartesianTrace2d";
    }

    public link(binders: GlCartesian2dTraceBinder[]): void
    {
        const attributeState = this.bindings.positionAttribute.getSharableState();

        for (let i = 0, iEnd = binders.length; i < iEnd; ++i)
        {
            binders[i].bindings.positionAttribute.link(attributeState);
        }
    }

    public setBufferLayout(bufferLayout: TGlF32BufferLayout): void
    {
        const theirBuffer = bufferLayout.swapBuffer(this.bindings.positionAttribute.getBuffer(), 0);
        this.bindings.positionAttribute.setBuffer(theirBuffer);
    }

    public getBufferLayout(): TGlF32BufferLayout
    {
        return new BufferLayout([new GlBuffer(null, Float32Array)]);
    }

    public areAttributesDirty(entity: TGlTraceEntity): boolean
    {
        const changeId = this.getChangeId(entity);
        return this.bindings.positionAttribute.getBuffer().changeId !== changeId;
    }

    public initialize(componentRenderer: TGlInstancedComponentRenderer): void
    {
        this.bindings.positionAttribute.initialize(componentRenderer);
        this.bindings.configUniform.initialize(componentRenderer);
    }

    public updateData(entity: TGlTraceEntity): void
    {
        const changeId = this.getChangeId(entity);
        this.bindings.positionAttribute.setData(entity.graphicsSettings.traces, changeId);
        this.config.setRow(1, this.colorCache.setRGBAColor(entity.graphicsSettings.traceColor, true));
        this.config[0] = entity.graphicsSettings.traceLinePixelSize;
        this.bindings.configUniform.setData(this.config, changeId);
    }

    public updatePointers(): void
    {
        // static pointers
    }

    public bindUniforms(componentRenderer: TGlInstancedComponentRenderer): void
    {
        this.bindings.configUniform.bind(componentRenderer);
    }

    public bindAttributes(componentRenderer: TGlInstancedComponentRenderer): void
    {
        this.bindings.positionAttribute.bindArray(componentRenderer);
    }

    public bindInstanced
    (
        componentRenderer: TGlInstancedComponentRenderer,
        divisor: number,
        usage?: GLenum,
    )
        : void
    {
        this.bindings.positionAttribute.bindArrayInstanced(componentRenderer, divisor, usage);
    }

    protected getChangeId(entity: TChangeTrackedTrait): number
    {
        return entity.changeId;
    }

    protected readonly bindings: {
        // vec4, defines both ends of the trace
        positionAttribute: IGlAttribute<Float32Array>;
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

#ifdef TRACE_CONNECTOR_BINDS_OUTPUT
VARYING vec4 traceConnector_outPosition;

void traceConnector_setPosition(vec2 lower, vec2 upper)
{
    traceConnector_outPosition = vec4(lower, upper);
}
#endif

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

const linkId = Symbol("cart-trace-2d");

/**
 * @internal
 */
export class GlCartesian2dTraceTransformBinder
    extends GlCartesian2dTraceBinder
    implements IGlTraceTransformBinder
{
    public setResultBuffers
    (
        entity: TGlTraceEntity,
        exchangeBinder: this,
        transformRenderer: TGl2ComponentRenderer,
        usage: number = transformRenderer.context.STREAM_DRAW,
    )
        : void
    {
        const bufferByteSize = entity.data.getTraceCount() * 4 * Float32Array.BYTES_PER_ELEMENT;
        exchangeBinder.bindings.positionAttribute.setSize(transformRenderer.context, bufferByteSize, usage, entity.changeId);
        exchangeBinder.bindings.positionAttribute.bindTransform(transformRenderer, 0);
    }

    public clearResultBuffers(transformRenderer: TGl2ComponentRenderer): void
    {
        transformRenderer.context.bindBufferBase(transformRenderer.context.TRANSFORM_FEEDBACK_BUFFER, 0, null);
    }

    public getTransformId(): string
    {
        return "cartesianTrace2d";
    }

    public resetState(): void
    {
        this.bindings.positionAttribute
            .getBuffer()
            .resetState();
    }
}