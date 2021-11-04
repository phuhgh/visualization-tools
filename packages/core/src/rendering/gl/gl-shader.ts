import { _Array } from "rc-js-util";

/**
 * @public
 * WebGl shader specification.
 */
export interface IGlShader
{
    readonly source: string;
    /**
     * Absence indicates version agnostic.
     */
    readonly requiredLanguageVersion?: number;
}

/**
 * @public
 * {@inheritDoc IGlShader}
 */
export class GlShader
{
    public constructor
    (
        public readonly source: string,
        /**
         * Absence indicates version agnostic.
         */
        public readonly requiredLanguageVersion?: number,
    )
    {
    }

    public static getShaderFlag(this: void, flagName: string, value: boolean): string
    {
        return [`#define `, flagName, value ? "1" : "0", `\n`].join(" ");
    }

    public static getShaderInt(this: void, flagName: string, value: number): string
    {
        return [`#define `, flagName, value, `\n`].join(" ");
    }

    public static combineShaders(shaders: IGlShader[]): IGlShader
    {
        let version = -1;

        for (let i = 0, iEnd = shaders.length; i < iEnd; ++i)
        {
            const shader = shaders[i];

            if (shader.requiredLanguageVersion != null && shader.requiredLanguageVersion > version)
            {
                version = shader.requiredLanguageVersion;
            }
        }

        const source = _Array
            .map(shaders, shader => shader.source)
            .join("\n");

        return new GlShader(
            source,
            version === -1 ? undefined : version,
        );
    }
}