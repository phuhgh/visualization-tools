import { IGlExtensions, TGlExtensionKeys } from "./i-gl-extensions";
import { _Array, _Debug, _Math, _Set, TKeysOf } from "rc-js-util";
import { GlShader, IGlShader } from "./gl-shader";

/**
 * @public
 * Specification of a webgl program to build.
 */
export interface IGlProgramSpec
{
    shaderLanguageVersion: number | undefined;
    vertexShader: IGlShader;
    fragmentShader: IGlShader;
    requiredExtensions: TKeysOf<IGlExtensions>;
    optionalExtensions: TKeysOf<IGlExtensions>;
}

/**
 * @public
 * {@inheritDoc IGlProgramSpec}
 */
export class GlProgramSpecification implements IGlProgramSpec
{
    public shaderLanguageVersion: number | undefined;

    public constructor
    (
        public vertexShader: IGlShader,
        public fragmentShader: IGlShader,
        public requiredExtensions: TKeysOf<IGlExtensions> = [],
        public optionalExtensions: TKeysOf<IGlExtensions> = [],
    )
    {
        DEBUG_MODE && _Debug.runBlock(() =>
        {
            const vlv = this.vertexShader.requiredLanguageVersion;
            const flv = this.fragmentShader.requiredLanguageVersion;

            if (vlv != null && flv != null)
            {
                _Debug.assert(vlv === flv, "vertex and fragment shader language versions must be the same");
            }
        });

        if (this.vertexShader.requiredLanguageVersion != null)
        {
            this.shaderLanguageVersion = this.vertexShader.requiredLanguageVersion;
        }
    }

    public static mergeProgramSpecifications(specs: IGlProgramSpec[]): IGlProgramSpec
    {
        const vertexVersion = GlProgramSpecification.getHighestShaderVersion(specs, "vertexShader");
        const fragmentVersion = GlProgramSpecification.getHighestShaderVersion(specs, "fragmentShader");
        const version = _Math.max(vertexVersion, fragmentVersion);

        const combinedVertexShader = GlProgramSpecification.combineShadersFinal(specs, "vertexShader", version, GlProgramSpecification.vertexShaderCompat);
        const combinedFragmentShader = GlProgramSpecification.combineShadersFinal(specs, "fragmentShader", version, GlProgramSpecification.fragmentShaderCompat);

        const requiredExts = _Array.collect(specs, new Set<TGlExtensionKeys>(), (extensions, specification) =>
        {
            _Array.forEach(specification.requiredExtensions, (extension) => extensions.add(extension));
        });
        const optionalExts = _Array.collect(specs, new Set<TGlExtensionKeys>(), (extensions, specification) =>
        {
            _Array.forEach(specification.optionalExtensions, (extension) => extensions.add(extension));
        });

        return new GlProgramSpecification
        (
            combinedVertexShader,
            combinedFragmentShader,
            _Set.valuesToArray(requiredExts),
            _Set.valuesToArray(optionalExts),
        );
    }

    private static getHighestShaderVersion(specs: IGlProgramSpec[], key: "vertexShader" | "fragmentShader"): number
    {
        let version = -1;

        for (let i = 0, iEnd = specs.length; i < iEnd; ++i)
        {
            const shader = specs[i][key];

            if (shader.requiredLanguageVersion != null && shader.requiredLanguageVersion > version)
            {
                version = shader.requiredLanguageVersion;
            }
        }

        return version;
    }

    private static combineShadersFinal
    (
        specs: IGlProgramSpec[],
        key: "vertexShader" | "fragmentShader",
        version: number,
        compatPrefix: string,
    )
        : IGlShader
    {
        const preLines = 3;
        const vertexParts = new Array(specs.length + preLines);

        let j = preLines;
        for (let i = 0, iEnd = specs.length; i < iEnd; ++i)
        {
            const shader = specs[i][key];
            vertexParts[j++] = shader.source;

            if (shader.requiredLanguageVersion != null && shader.requiredLanguageVersion > version)
            {
                version = shader.requiredLanguageVersion;
            }
        }

        vertexParts[0] = version === -1 ? "" : `#version ${version} es`;
        vertexParts[2] = compatPrefix;

        return new GlShader
        (
            vertexParts.join("\n"),
            version === -1 ? undefined : version,
        );
    }

    // @formatter:off
    // when updating make sure to update the language injection prefix
    // language=GLSL
    private static vertexShaderCompat =
    `
#if __VERSION__ >=300 && __VERSION__ < 400
#define ATTRIBUTE in
#define VARYING out
#else
#define ATTRIBUTE attribute
#define VARYING varying
#endif`;
    // @formatter:on

    // @formatter:off
    // when updating make sure to update the language injection prefix
    // language=GLSL
    private static fragmentShaderCompat =
        `
#if __VERSION__ >=300 && __VERSION__ < 400
out highp vec4 fragColor;
#endif

#if __VERSION__ >=300 && __VERSION__ < 400
#define VARYING in
#define TEXTURE2D texture
#else
#define VARYING varying
#define TEXTURE2D texture2D
#endif

void setFragmentColor(in lowp vec4 color)
{
    #if __VERSION__ >=300 && __VERSION__ < 400
    fragColor = color;
    #else
    gl_FragColor = color;
    #endif
}`;
    // @formatter:on
}
