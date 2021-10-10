import { _Array, _Debug, Mat2, Mat4, Once, Vec4 } from "rc-js-util";
import { IDrawablePoint2dOffsets } from "../../series/i-drawable-point2d-offsets";
import { TInterleavedPoint2dTrait } from "../../traits/t-interleaved-point2d-trait";
import { IGlIndexedPoint2dBinder, IndexedPoint2dIdentifier } from "../i-gl-indexed-point2d-binder";
import { AGlInstancedBinder, emptyShader, GlFloatAttribute, GlFloatBuffer, GlIVec4Uniform, GlMat2Uniform, GlMat4Uniform, GlProgramSpecification, GlShader, IGlAttribute, IGlProgramSpec, IGlShader, IInterleavedBindingDescriptor, mat2MultiplyValueShader, TGl2ComponentRenderer, unpackColorShader } from "@visualization-tools/core";

/**
 * @public
 */
export type TGlInterleavedPointBinderConfig =
    | { pointsToBind: number; }
    | { bindsOutput: boolean; }
    ;

/**
 * @public
 * Provides bindings for an interleaved buffer that described points in 2d.
 *
 * @remarks
 * These may optionally have per point color and size. Where either size or color is not described by the buffer, local config
 * will be supplied in instead. The type of buffer may not be changed after creation (e.g. adding size).
 **/
export class GlInterleaved2dPointBinder
    extends AGlInstancedBinder<TGl2ComponentRenderer, TInterleavedPoint2dTrait<Float32Array>>
    implements IGlIndexedPoint2dBinder<Float32Array>
{
    public specification: IGlProgramSpec;
    public readonly pointsBound: number;
    public readonly binderClassificationId = IndexedPoint2dIdentifier;
    public readonly linkId = linkId;

    public constructor
    (
        private readonly bindingDescriptor: IInterleavedBindingDescriptor<IDrawablePoint2dOffsets>,
        protected readonly binderConfig: TGlInterleavedPointBinderConfig = { pointsToBind: 1, bindsOutput: false },
    )
    {
        super();
        this.uniformsToBind = GlInterleaved2dPointBinder.getUniformsToBind(bindingDescriptor.offsets);
        this.bindings = this.getBindings(bindingDescriptor, binderConfig);
        this.specification = GlInterleaved2dPointBinder.generateProgram(bindingDescriptor, binderConfig);
        this.pointsBound = GlInterleaved2dPointBinder.isTransformConfig(binderConfig) ? 1 : binderConfig.pointsToBind;
    }

    public getTransformId(): string
    {
        // a vec4 is always used and copied before hand, so it's safe to share the transform regardless
        return "interleavedPoint2d";
    }

    @Once
    public getBinderId(): string
    {
        const preprocessorStatements = [
            "interleavedPoint2d",
            this.pointsBound,
            this.bindingDescriptor.offsets.color == null ? "noColor" : "color",
            this.bindingDescriptor.offsets.size == null ? "size" : "noSize",
        ];

        return preprocessorStatements.join("_");
    }

    public link(binders: GlInterleaved2dPointBinder[]): void
    {
        const attributeState = this.bindings.pointAttributes[0].getSharableState();

        for (let i = 0, iEnd = binders.length; i < iEnd; ++i)
        {
            const pointAttributes = binders[i].bindings.pointAttributes;

            for (let j = 0, jEnd = pointAttributes.length; j < jEnd; ++j)
            {
                pointAttributes[j].link(attributeState);
            }
        }
    }

    public swapBuffers(binder: GlInterleaved2dPointBinder): void
    {
        // all attributes share the same buffer, only 1 swap is required
        this.bindings.pointAttributes[0].swapBuffer(binder.bindings.pointAttributes[0]);
    }

    public setResultBuffers
    (
        entity: TInterleavedPoint2dTrait<Float32Array>,
        binder: GlInterleaved2dPointBinder,
        componentRenderer: TGl2ComponentRenderer,
        usage: GLenum,
    )
        : void
    {
        const theirAttributes = binder.bindings.pointAttributes;
        const bufferByteSize = entity.data.getBlockByteSize() * entity.data.getLength();
        const changeId = entity.changeId;

        // only 1 buffer used during transform as the buffer is shared
        theirAttributes[0].setSize(componentRenderer.context, bufferByteSize, usage, changeId);
        theirAttributes[0].bindTransform(componentRenderer, 0);
    }

    public getTransformBinder(): IGlIndexedPoint2dBinder<Float32Array>
    {
        return new GlInterleaved2dPointBinder(this.bindingDescriptor, { ...this.binderConfig, bindsOutput: true });
    }

    public clearResultBuffers(componentRenderer: TGl2ComponentRenderer): void
    {
        componentRenderer.context.bindBufferBase(componentRenderer.context.TRANSFORM_FEEDBACK_BUFFER, 0, null);
    }

    public initialize(componentRenderer: TGl2ComponentRenderer): void
    {
        const pointAttributes = this.bindings.pointAttributes;

        for (let i = 0, iEnd = pointAttributes.length; i < iEnd; ++i)
        {
            pointAttributes[i].initialize(componentRenderer);
        }

        if (this.uniformsToBind & EUniformBinding.BindDisplaySettings)
        {
            this.bindings.displayConfigUniform.initialize(componentRenderer);
        }

        if (this.uniformsToBind & EUniformBinding.BindSizeTransform)
        {
            this.bindings.sizeTransformUniform.initialize(componentRenderer);
        }

        this.bindings.offsetUniform.initialize(componentRenderer);
    }

    public updateData(entity: TInterleavedPoint2dTrait<Float32Array>, changeId: number): void
    {
        const data = entity.data;
        this.bindings.pointAttributes[0].setData(data.getInterleavedBuffer(), changeId);

        if (this.uniformsToBind & EUniformBinding.BindDisplaySettings)
        {
            this.bindings.displayConfigUniform.setData(entity.graphicsSettings.pointDisplay, changeId);
        }

        if (this.uniformsToBind & EUniformBinding.BindSizeTransform)
        {
            const transform = entity.graphicsSettings.pointSizeNormalizer.getSizeToPixelTransform();
            this.bindings.sizeTransformUniform.setData(transform, changeId);
        }

        this.offsets[0] = data.offsets.x;
        this.offsets[1] = data.offsets.y;

        if (data.offsets.size != null)
        {
            this.offsets[2] = data.offsets.size;
        }

        if (data.offsets.color != null)
        {
            this.offsets[3] = data.offsets.color;
        }
    }

    public overrideColors
    (
        componentRenderer: TGl2ComponentRenderer,
        entity: TInterleavedPoint2dTrait<Float32Array>,
        changeId: number,
    )
        : void
    {
        const highlightedSegments = entity.graphicsSettings.pointDisplay.highlightedSegments;
        const colorOffset = entity.data.offsets.color;

        if (highlightedSegments == null || colorOffset == null)
        {
            return;
        }

        const pointAttribute = this.bindings.pointAttributes[0];
        const blockByteSize = entity.data.getBlockByteSize();
        const byteOffset = colorOffset * Float32Array.BYTES_PER_ELEMENT;
        const overrides = GlInterleaved2dPointBinder.generateOverrides(entity, highlightedSegments);

        for (let i = 0, iEnd = overrides.length; i < iEnd; ++i)
        {
            const override = overrides[i];
            pointAttribute.setSubBufferData(componentRenderer, override[0] * blockByteSize + byteOffset, override[1], changeId, i);
        }
    }

    public updatePointers(entity: TInterleavedPoint2dTrait<Float32Array>): void
    {
        this.setPointers(entity.data.getStart(), entity.data.getBlockByteSize());
    }

    public setPointers(startIndex: number, blockByteSize: number): void
    {
        const pointAttributes = this.bindings.pointAttributes;
        const byteOffsetToStart = startIndex * blockByteSize;
        const byteStride = this.pointsBound * blockByteSize;

        for (let i = 0, iEnd = pointAttributes.length; i < iEnd; ++i)
        {
            const attribute = pointAttributes[i];
            attribute.setOffset(byteOffsetToStart + blockByteSize * i);
            attribute.setStride(byteStride);
        }
    }

    public bindUniforms(componentRenderer: TGl2ComponentRenderer): void
    {
        this.bindings.offsetUniform.bind(componentRenderer);

        if (this.uniformsToBind & EUniformBinding.BindDisplaySettings)
        {
            this.bindings.displayConfigUniform.bind(componentRenderer);
        }

        if (this.uniformsToBind & EUniformBinding.BindSizeTransform)
        {
            this.bindings.sizeTransformUniform.bind(componentRenderer);
        }
    }

    public bindAttributes(componentRenderer: TGl2ComponentRenderer): void
    {
        const pointAttributes = this.bindings.pointAttributes;

        for (let i = 0, iEnd = pointAttributes.length; i < iEnd; ++i)
        {
            pointAttributes[i].bindArray(componentRenderer);
        }
    }

    public bindInstanced
    (
        componentRenderer: TGl2ComponentRenderer,
        divisor: number,
        usage?: GLenum,
    )
        : void
    {
        const pointAttributes = this.bindings.pointAttributes;

        for (let i = 0, iEnd = pointAttributes.length; i < iEnd; ++i)
        {
            pointAttributes[i].bindArrayInstanced(componentRenderer, divisor, usage);
        }
    }

    private getBindings
    (
        bindingDescriptor: IInterleavedBindingDescriptor<IDrawablePoint2dOffsets>,
        binderConfig: TGlInterleavedPointBinderConfig,
    )
        : IInterleavedPointGlBindings
    {
        const blockElementCount = bindingDescriptor.blockElementCount;
        const byteOffset = bindingDescriptor.byteOffset;

        const pointAttributes = [
            new GlFloatAttribute("interleavedPoint_point", new GlFloatBuffer(null), blockElementCount, byteOffset),
        ];
        const sharedPointState = pointAttributes[0].getSharableState();

        if (!GlInterleaved2dPointBinder.isTransformConfig(binderConfig))
        {
            DEBUG_MODE && _Debug.assert(binderConfig.pointsToBind > 0, "expected to bind points");

            for (let i = 1, iEnd = binderConfig.pointsToBind; i < iEnd; ++i)
            {
                const attribute = new GlFloatAttribute(`interleavedPoint_point${i}`, new GlFloatBuffer(null), blockElementCount, byteOffset * i);
                attribute.link(sharedPointState);
                pointAttributes.push(attribute);
            }
        }

        return {
            pointAttributes: pointAttributes,
            displayConfigUniform: new GlMat4Uniform("interleavedPoint_config", Mat4.f32.factory.createOneEmpty()),
            sizeTransformUniform: new GlMat2Uniform("interleavedPoint_sizeTransform", Mat2.f32.factory.createOneEmpty()),
            offsetUniform: new GlIVec4Uniform("interleavedPoint_offsets", this.offsets),
        };
    }

    private static generateProgram
    (
        bindingDescriptor: IInterleavedBindingDescriptor<IDrawablePoint2dOffsets>,
        binderConfig: TGlInterleavedPointBinderConfig,
    )
        : IGlProgramSpec
    {
        const isTransformConfig = GlInterleaved2dPointBinder.isTransformConfig(binderConfig);
        const vertexShaders = [
            GlInterleaved2dPointBinder.getPreprocessorConstants(bindingDescriptor, isTransformConfig),
            unpackColorShader,
            mat2MultiplyValueShader,
            pointConnectorShader,
            generateAccessor(undefined),
            outputShader,
        ];

        if (!isTransformConfig)
        {
            for (let i = 1, iEnd = binderConfig.pointsToBind; i < iEnd; ++i)
            {
                vertexShaders.push(generateAccessor(i));
            }
        }

        return new GlProgramSpecification(
            GlShader.combineShaders(vertexShaders),
            emptyShader,
            _Array.emptyArray,
            _Array.emptyArray,
            isTransformConfig ? ["interleavedPoint_outPoint"] : _Array.emptyArray,
        );
    }

    private static getPreprocessorConstants
    (
        bindingDescriptor: IInterleavedBindingDescriptor<IDrawablePoint2dOffsets>,
        bindsOutput: boolean,
    )
        : IGlShader
    {
        const preprocessorStatements = [
            GlShader.getShaderFlag("INTERLEAVED_BINDS_OUTPUT", bindsOutput),
            GlShader.getShaderFlag("HAS_COLOR_OFFSET", bindingDescriptor.offsets.color != null),
            GlShader.getShaderFlag("HAS_SIZE_OFFSET", bindingDescriptor.offsets.size != null),
        ];

        return new GlShader(preprocessorStatements.join("\n"));
    }

    private static getUniformsToBind(offsets: IDrawablePoint2dOffsets): EUniformBinding
    {
        const shouldBindDisplaySettings = (offsets.color == null || offsets.size == null)
            ? EUniformBinding.BindDisplaySettings
            : 0;

        const shouldBindSizeTransform = (offsets.size != null)
            ? EUniformBinding.BindSizeTransform
            : 0;

        return shouldBindDisplaySettings | shouldBindSizeTransform;
    }

    private static isTransformConfig(config: TGlInterleavedPointBinderConfig): config is { bindsOutput: boolean; }
    {
        return Boolean((config as { bindsOutput: boolean; }).bindsOutput);
    }

    private static generateOverrides(entity: TInterleavedPoint2dTrait<Float32Array>, segments: ReadonlySet<number>)
    {
        const color = entity.graphicsSettings.pointDisplay.packedHighlightColor;
        const colorOverrides = new Array(segments.size * 2);
        let index = 0;

        for (const segmentId of segments)
        {
            // FIXME generate less garbage?
            colorOverrides[index] = [segmentId, new Float32Array([color])];
            colorOverrides[index + 1] = [segmentId + 1, new Float32Array([color])];
            index += 2;
        }

        return colorOverrides;
    }

    private readonly bindings: IInterleavedPointGlBindings;
    private readonly uniformsToBind: EUniformBinding;
    private readonly offsets = Vec4.i32.factory.createOneEmpty();
}

interface IInterleavedPointGlBindings
{
    pointAttributes: IGlAttribute<Float32Array>[];
    displayConfigUniform: GlMat4Uniform;
    sizeTransformUniform: GlMat2Uniform;
    offsetUniform: GlIVec4Uniform;
}

const pointConnectorShader = new GlShader
(
    // @formatter:off
    `
/* === interleaved point connector === */
uniform highp mat4 interleavedPoint_config;
uniform highp mat2 interleavedPoint_sizeTransform;
uniform lowp ivec4 interleavedPoint_offsets;

#define GET_POSITION(NAME, SOURCE) vec2 NAME (void) \\
{ \\
    return vec2( SOURCE [interleavedPoint_offsets.x], SOURCE [interleavedPoint_offsets.y]); \\
}
#define SET_POSITION(NAME, DESTINATION) void NAME (vec2 position) \\
{ \\
    DESTINATION[interleavedPoint_offsets.x] = position.x; \\
    DESTINATION[interleavedPoint_offsets.y] = position.y; \\
}
#define GET_SIZE_FROM_UNIFORM(NAME) float NAME (void) \\
{ \\
    return interleavedPoint_config[0][0]; \\
}
#define GET_SIZE_FROM_ATTRIBUTE(NAME, SOURCE) float NAME (void) \\
{ \\
    return mat2MultiplyValue(interleavedPoint_sizeTransform, SOURCE [interleavedPoint_offsets.z]); \\
}
# define GET_COLOR_FROM_UNIFORM(NAME) vec4 NAME (void) \\
{ \\
    return vec4(interleavedPoint_config[1]); \\
}
# define GET_COLOR_FROM_ATTRIBUTE(NAME, SOURCE) vec4 NAME (void) \\
{ \\
 return unpackColor( SOURCE [interleavedPoint_offsets.w]); \\
}
`,
    // @formatter:on
);

function generateAccessor(index: number | undefined)
{
    const postfix = index == null ? "" : index.toString();

    return new GlShader(`
ATTRIBUTE highp vec4 interleavedPoint_point${postfix};

GET_POSITION(pointConnector_getPosition${postfix}, interleavedPoint_point${postfix})

#if HAS_SIZE_OFFSET
GET_SIZE_FROM_ATTRIBUTE(pointConnector_getSize${postfix}, interleavedPoint_point${postfix})
#else
GET_SIZE_FROM_UNIFORM(pointConnector_getSize${postfix})
#endif

#if HAS_COLOR_OFFSET
GET_COLOR_FROM_ATTRIBUTE(pointConnector_getColor${postfix}, interleavedPoint_point${postfix})
#else
GET_COLOR_FROM_UNIFORM(pointConnector_getColor${postfix})
#endif
`);
}

const outputShader = new GlShader(`
#if INTERLEAVED_BINDS_OUTPUT
VARYING vec4 interleavedPoint_outPoint;
void pointConnector_copyAllOutputs()
{
    interleavedPoint_outPoint = interleavedPoint_point;
}
SET_POSITION(pointConnector_setPosition, interleavedPoint_outPoint)
#endif
`);

enum EUniformBinding
{
    BindDisplaySettings = 1 << 0,
    BindSizeTransform = 1 << 1,
}

const linkId = Symbol("cart-trace-2d");