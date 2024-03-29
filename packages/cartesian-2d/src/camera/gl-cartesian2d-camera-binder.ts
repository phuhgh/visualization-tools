import { ICartesian2dTransforms } from "../update/update-arg/cartesian2d-transforms";
import { Mat3 } from "rc-js-util";
import { AGlBinder, BufferLayout, emptyShader, GlFloatUniform, GlMat3Uniform, GlProgramSpecification, GlShader, mat3MultiplyVec2Shader, TGlBasicComponentRenderer, TGlF32BufferLayout } from "@visualization-tools/core";
import { ICartesian2dUpdateArg } from "../update/update-arg/cartesian2d-update-arg";
import { IGlCamera2dBinder } from "./i-gl-camera2d-binder";
import { T2dAbsoluteZIndexTrait } from "../traits/t2d-absolute-z-index-trait";

// FIXME: slightly different category of problem with binder (in that it's transform independent), would like a garbage free version
/**
 * @public
 */
export class GlCartesian2dUpdateArg
{
    public constructor
    (
        public readonly transforms: ICartesian2dTransforms<Float32Array>,
        public readonly changeId: number,
        public readonly zIndexAbs: number,
    )
    {
}
}

/**
 * @public
 * Provides WebGL bindings for cartesian 2d graphics components.
 */
export interface IGlCartesian2dCameraBinder
    extends IGlCamera2dBinder<GlCartesian2dUpdateArg, ICartesian2dUpdateArg<Float32Array>>
{
}

/**
 * @public
 * {@inheritDoc IGlCartesian2dCameraBinder}
 */
export class GlCartesian2dCameraBinder
    extends AGlBinder<TGlBasicComponentRenderer, GlCartesian2dUpdateArg, TGlF32BufferLayout>
    implements IGlCartesian2dCameraBinder
{
    public specification = specification;
    public binderClassificationId = Symbol(); // no category matching allowed

    public getBinderId(): string
    {
        return "GlCamera2d";
    }

    public setBufferLayout(): void
    {
        // no attributes to set
    }

    public getBufferLayout(): TGlF32BufferLayout
    {
        return new BufferLayout([]);
    }

    public areAttributesDirty(): boolean
    {
        return false;
    }

    public initialize(componentRenderer: TGlBasicComponentRenderer): void
    {
        this.bindings.cameraWorld.initialize(componentRenderer);
        this.bindings.z.initialize(componentRenderer);
    }

    public getBinderData(connector: T2dAbsoluteZIndexTrait, updateArg: ICartesian2dUpdateArg<Float32Array>, renderer: TGlBasicComponentRenderer): GlCartesian2dUpdateArg
    {
        return new GlCartesian2dUpdateArg(
            updateArg.drawTransforms,
            renderer.sharedState.frameCounter,
            connector.graphicsSettings.zIndexAbs,
        );
    }

    public updatePointers(): void
    {
        // no action needed
    }

    public updateData(updateArg: GlCartesian2dUpdateArg): void
    {
        this.bindings.cameraWorld.setData(updateArg.transforms.dataToInteractiveArea, updateArg.changeId);
        this.bindings.z.setData(updateArg.zIndexAbs);
    }

    public bindUniforms(componentRenderer: TGlBasicComponentRenderer): void
    {
        this.bindings.cameraWorld.bind(componentRenderer);
        this.bindings.z.bind(componentRenderer);
    }

    public bindAttributes(): void
    {
        // no attributes to bind
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