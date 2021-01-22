import { GlProgramSpecification, IGlProgramSpec } from "../gl-program-specification";
import { dummyShader } from "./dummy-shader";

/**
 * @public
 */
export const dummyGlProgramSpecification: IGlProgramSpec = new GlProgramSpecification(dummyShader, dummyShader);