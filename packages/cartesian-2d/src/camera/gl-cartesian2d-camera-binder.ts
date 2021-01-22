import { ICartesian2dTransforms } from "../update/cartesian2d-transforms";
import { Mat3 } from "rc-js-util";
import { T2dAbsoluteZIndexTrait } from "../traits/t2d-absolute-z-index-trait";
import { AGlBinder, emptyShader, GlFloatUniform, GlMat3Uniform, GlProgramSpecification, GlShader, IGlBinder, mat3MultiplyVec2Shader, TGlBasicEntityRenderer } from "@visualization-tools/core";

/**
 * @public
 * Provides WebGL bindings for cartesian 2d graphics components.
 */
export interface IGlCartesian2dCameraBinder
    extends IGlBinder<ICartesian2dTransforms<Float32Array>, TGlBasicEntityRenderer>
{
    setZ(entity: T2dAbsoluteZIndexTrait): void;
}

/**
 * @public
 * {@inheritDoc IGlCartesian2dCameraBinder}
 */
export class GlCartesian2dCameraBinder
    extends AGlBinder<ICartesian2dTransforms<Float32Array>, TGlBasicEntityRenderer>
    implements IGlCartesian2dCameraBinder
{
    public specification = specification;

    public initialize(entityRenderer: TGlBasicEntityRenderer): void
    {
        this.bindings.cameraWorld.initialize(entityRenderer);
        this.bindings.z.initialize(entityRenderer);
    }

    public updatePointers(): void
    {
        // no action needed
    }

    public setZ(entity: T2dAbsoluteZIndexTrait): void
    {
        this.bindings.z.setData(entity.graphicsSettings.zIndexAbs);
    }

    public updateData(camera: ICartesian2dTransforms<Float32Array>): void
    {
        this.bindings.cameraWorld.setData(camera.dataToInteractiveArea);
    }

    public bindUniforms(entityRenderer: TGlBasicEntityRenderer): void
    {
        this.bindings.cameraWorld.bind(entityRenderer);
        this.bindings.z.bind(entityRenderer);
    }

    public bindAttributes(): void
    {
        // no attributes to bind
    }

    public getCacheId(): string
    {
        return "GlCamera2d";
    }

    private static getBindings(): ICamera2dBindings
    {
        return {
            cameraWorld: new GlMat3Uniform("u_2dCamera_dataToCanvas", new Mat3.f32()),
            z: new GlFloatUniform("u_2dCamera_z", 0),
        };
    }

    private bindings: ICamera2dBindings = GlCartesian2dCameraBinder.getBindings();
}

interface ICamera2dBindings
{
    cameraWorld: GlMat3Uniform;
    z: GlFloatUniform;
}

const specification = new GlProgramSpecification
(
    GlShader.combineShaders([
        mat3MultiplyVec2Shader,
// language=GLSL
        new GlShader
        (
            // @formatter:off
            `
/* === camera2d === */
uniform highp mat3 u_2dCamera_dataToCanvas;
uniform highp float u_2dCamera_z;

vec3 v_2dCamera_getClipspaceCoords2d(vec2 coords)
{
    return vec3(mat3MultiplyVec2(u_2dCamera_dataToCanvas, coords), u_2dCamera_z);
}
`,
            // @formatter:on
        ),
    ]),
    emptyShader,
);