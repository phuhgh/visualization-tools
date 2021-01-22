import { _Debug, Mat2, Mat4, Once } from "rc-js-util";
import { IDrawablePoint2dOffsets } from "../../series/i-drawable-point2d-offsets";
import { TInterleavedPoint2dTrait } from "../../traits/t-interleaved-point2d-trait";
import { IGlIndexedPoint2dBinder } from "../i-gl-indexed-point2d-binder";
import { AGlInstancedBinder, emptyShader, GlBuffer, GlFloatAttribute, GlMat2Uniform, GlMat4Uniform, GlProgramSpecification, GlShader, IGlAttribute, IGlProgramSpec, IGlShader, IInterleavedBindingDescriptor, mat2MultiplyValueShader, TGl2EntityRenderer, unpackColorShader } from "@visualization-tools/core";

/**
 * @public
 */
export interface IGlInterleavedPointBinderConfig
{
    byteStride?: number;
    /**
     * Each point added adds an attribute.
     */
    pointsToBind: number;
}

/**
 * @public
 * Provides bindings for an interleaved buffer that described points in 2d.
 *
 * @remarks
 * These may optionally have per point color and size. Where either size or color is not described by the buffer, local config
 * will be supplied in instead. The type of buffer may not be changed after creation (e.g. adding size).
 **/
export class GlInterleaved2dPointBinder
    extends AGlInstancedBinder<TInterleavedPoint2dTrait<Float32Array>, TGl2EntityRenderer>
    implements IGlIndexedPoint2dBinder<Float32Array>
{
    public specification: IGlProgramSpec;
    public readonly pointsBound: number;

    public constructor
    (
        private readonly bindingDescriptor: IInterleavedBindingDescriptor<IDrawablePoint2dOffsets>,
        protected readonly binderConfig: IGlInterleavedPointBinderConfig = { pointsToBind: 1 },
    )
    {
        super();
        this.uniformsToBind = GlInterleaved2dPointBinder.getUniformsToBind(bindingDescriptor.offsets);
        this.bindings = this.getBindings(bindingDescriptor, binderConfig);
        this.specification = GlInterleaved2dPointBinder.generateProgram(bindingDescriptor, binderConfig);
        this.pointsBound = binderConfig.pointsToBind;
    }

    @Once
    public getCacheId(): string
    {
        const preprocessorStatements = [
            "PC",
            this.binderConfig.pointsToBind,
            "interleavedPoint",
            this.bindingDescriptor.offsets.x,
            this.bindingDescriptor.offsets.y,
            this.bindingDescriptor.offsets.color ?? "nco",
            this.bindingDescriptor.offsets.size ?? "nso",
        ];

        return preprocessorStatements.join("_");
    }

    public mergeTracePositionBuffers(binders: GlInterleaved2dPointBinder[]): void
    {
        const pointBuffer = GlFloatAttribute.extractBuffer(this.bindings.pointAttributes[0]);

        for (let i = 0, iEnd = binders.length; i < iEnd; ++i)
        {
            const pointAttributes = binders[i].bindings.pointAttributes;

            for (let j = 0, jEnd = pointAttributes.length; j < jEnd; ++j)
            {
                GlFloatAttribute.setBuffer(pointAttributes[j], pointBuffer);
            }
        }
    }

    public initialize(entityRenderer: TGl2EntityRenderer): void
    {
        const pointAttributes = this.bindings.pointAttributes;

        for (let i = 0, iEnd = pointAttributes.length; i < iEnd; ++i)
        {
            pointAttributes[i].initialize(entityRenderer);
        }

        if (this.uniformsToBind & EUniformBinding.BindDisplaySettings)
        {
            this.bindings.displayConfigUniform.initialize(entityRenderer);
        }

        if (this.uniformsToBind & EUniformBinding.BindSizeTransform)
        {
            this.bindings.sizeTransformUniform.initialize(entityRenderer);
        }
    }

    public updateData(entity: TInterleavedPoint2dTrait<Float32Array>): void
    {
        DEBUG_MODE && _Debug.runBlock(() =>
        {
            _Debug.assert(entity.data.offsets.x === this.bindingDescriptor.offsets.x, "connector does not match");
            _Debug.assert(entity.data.offsets.y === this.bindingDescriptor.offsets.y, "connector does not match");
            _Debug.assert(entity.data.offsets.color === this.bindingDescriptor.offsets.color, "connector does not match");
            _Debug.assert(entity.data.offsets.size === this.bindingDescriptor.offsets.size, "connector does not match");
            _Debug.assert(entity.data.getBlockElementCount() === this.bindingDescriptor.blockElementCount, "connector does not match");
        });

        // setting one sets all as they share the same buffer
        this.bindings.pointAttributes[0].setData(entity.data.getInterleavedBuffer(), entity.changeId);

        if (this.uniformsToBind & EUniformBinding.BindDisplaySettings)
        {
            this.bindings.displayConfigUniform.setData(entity.graphicsSettings.pointDisplay);
        }

        if (this.uniformsToBind & EUniformBinding.BindSizeTransform)
        {
            this.bindings.sizeTransformUniform.setData(entity.graphicsSettings.pointSizeNormalizer.getSizeToPixelTransform());
        }
    }

    public overrideColors(entityRenderer: TGl2EntityRenderer, entity: TInterleavedPoint2dTrait<Float32Array>): void
    {
        const overrides = entity.graphicsSettings.pointDisplay.colorOverrides;
        const colorOffset = entity.data.offsets.color;

        if (overrides == null || colorOffset == null)
        {
            return;
        }

        const pointAttribute = this.bindings.pointAttributes[0];
        const changeId = entity.changeId;
        const blockByteSize = entity.data.getBlockByteSize();
        const byteOffset = colorOffset * Float32Array.BYTES_PER_ELEMENT;

        for (let i = 0, iEnd = overrides.length; i < iEnd; ++i)
        {
            const override = overrides[i];
            pointAttribute.overrideValues(entityRenderer, override[0] * blockByteSize + byteOffset, override[1], changeId, i);
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

        for (let i = 0, iEnd = pointAttributes.length; i < iEnd; ++i)
        {
            pointAttributes[i].setOffset(byteOffsetToStart + blockByteSize * i);
        }
    }

    public bindUniforms(entityRenderer: TGl2EntityRenderer): void
    {
        if (this.uniformsToBind & EUniformBinding.BindDisplaySettings)
        {
            this.bindings.displayConfigUniform.bind(entityRenderer);
        }

        if (this.uniformsToBind & EUniformBinding.BindSizeTransform)
        {
            this.bindings.sizeTransformUniform.bind(entityRenderer);
        }
    }

    public bindAttributes(entityRenderer: TGl2EntityRenderer): void
    {
        const pointAttributes = this.bindings.pointAttributes;

        for (let i = 0, iEnd = pointAttributes.length; i < iEnd; ++i)
        {
            pointAttributes[i].bind(entityRenderer);
        }
    }

    public bindInstanced
    (
        entityRenderer: TGl2EntityRenderer,
        divisor: number,
        usage?: GLenum,
    )
        : void
    {
        const pointAttributes = this.bindings.pointAttributes;

        for (let i = 0, iEnd = pointAttributes.length; i < iEnd; ++i)
        {
            pointAttributes[i].bindInstanced(entityRenderer, divisor, usage);
        }
    }

    private getBindings
    (
        bindingDescriptor: IInterleavedBindingDescriptor<IDrawablePoint2dOffsets>,
        bindConfig: IGlInterleavedPointBinderConfig,
    )
        : IInterleavedPointGlBindings
    {
        const blockElementCount = bindingDescriptor.blockElementCount;
        const byteOffset = bindingDescriptor.byteOffset;
        const byteStride = this.binderConfig.byteStride;
        const pointBuffer = new GlBuffer(null);

        const pointAttributes = [
            new GlFloatAttribute("interleavedPoint_point", pointBuffer, blockElementCount, byteOffset, byteStride),
        ];

        for (let i = 1, iEnd = bindConfig.pointsToBind; i < iEnd; ++i)
        {
            pointAttributes.push(new GlFloatAttribute(`interleavedPoint_point${i}`, pointBuffer, blockElementCount, byteOffset * i, byteStride));
        }

        return {
            pointAttributes: pointAttributes,
            displayConfigUniform: new GlMat4Uniform("interleavedPoint_config", Mat4.f32.factory.createOneEmpty()),
            sizeTransformUniform: new GlMat2Uniform("interleavedPoint_sizeTransform", Mat2.f32.factory.createOneEmpty()),
        };
    }

    private static generateProgram
    (
        bindingDescriptor: IInterleavedBindingDescriptor<IDrawablePoint2dOffsets>,
        binderConfig: IGlInterleavedPointBinderConfig,
    )
        : IGlProgramSpec
    {
        DEBUG_MODE && _Debug.assert(binderConfig.pointsToBind > 0, "expected to bind points");

        const vertexShaders = [
            GlInterleaved2dPointBinder.getPreprocessorConstants(bindingDescriptor),
            unpackColorShader,
            mat2MultiplyValueShader,
            pointConnectorShader,
            generateAccessor(undefined),
        ];

        for (let i = 1, iEnd = binderConfig.pointsToBind; i < iEnd; ++i)
        {
            vertexShaders.push(generateAccessor(i));
        }

        return new GlProgramSpecification(GlShader.combineShaders(vertexShaders), emptyShader);
    }

    private static getPreprocessorConstants(bindingDescriptor: IInterleavedBindingDescriptor<IDrawablePoint2dOffsets>): IGlShader
    {
        const preprocessorStatements = [
            GlShader.getShaderInt("X_OFFSET", bindingDescriptor.offsets.x),
            GlShader.getShaderInt("Y_OFFSET", bindingDescriptor.offsets.y),
        ];

        if (bindingDescriptor.offsets.color != null)
        {
            preprocessorStatements.push(GlShader.getShaderInt("COLOR_OFFSET", bindingDescriptor.offsets.color));
        }

        if (bindingDescriptor.offsets.size != null)
        {
            preprocessorStatements.push(GlShader.getShaderInt("SIZE_OFFSET", bindingDescriptor.offsets.size));
        }

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

    private readonly bindings: IInterleavedPointGlBindings;
    private readonly uniformsToBind: EUniformBinding;
}

interface IInterleavedPointGlBindings
{
    pointAttributes: IGlAttribute[];
    displayConfigUniform: GlMat4Uniform;
    sizeTransformUniform: GlMat2Uniform;
}

const pointConnectorShader = new GlShader
(
    // @formatter:off
    // language=GLSL prefix="#if __VERSION__ >=300 && __VERSION__ < 400 \n #define ATTRIBUTE in \n #define VARYING out \n #else \n #define ATTRIBUTE attribute \n #define VARYING varying \n #endif"
    `
/* === interleaved point connector === */
uniform highp mat4 interleavedPoint_config;
uniform highp mat2 interleavedPoint_sizeTransform;

#define GET_POSITION(NAME, SOURCE) vec2 NAME (void) \\
{ \\
    return vec2( SOURCE [X_OFFSET], SOURCE [Y_OFFSET]); \\
}
#define GET_SIZE_FROM_UNIFORM(NAME) float NAME (void) \\
{ \\
    return interleavedPoint_config[0][0]; \\
}
#define GET_SIZE_FROM_ATTRIBUTE(NAME, SOURCE) float NAME (void) \\
{ \\
    return mat2MultiplyValue(interleavedPoint_sizeTransform, SOURCE [SIZE_OFFSET]); \\
}
# define GET_COLOR_FROM_UNIFORM(NAME) vec4 NAME (void) \\
{ \\
    return vec4(interleavedPoint_config[1]); \\
}
# define GET_COLOR_FROM_ATTRIBUTE(NAME, SOURCE) vec4 NAME (void) \\
{ \\
 return unpackColor( SOURCE [COLOR_OFFSET]); \\
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

#ifdef SIZE_OFFSET
GET_SIZE_FROM_ATTRIBUTE(pointConnector_getSize${postfix}, interleavedPoint_point${postfix})
#else
GET_SIZE_FROM_UNIFORM(pointConnector_getSize${postfix})
#endif

#ifdef COLOR_OFFSET
GET_COLOR_FROM_ATTRIBUTE(pointConnector_getColor${postfix}, interleavedPoint_point${postfix})
#else
GET_COLOR_FROM_UNIFORM(pointConnector_getColor${postfix})
#endif
`);
}

enum EUniformBinding
{
    BindDisplaySettings = 1 << 0,
    BindSizeTransform = 1 << 1,
}
