import { GlProgramSpecification, IGlProgramSpec } from "../gl-program-specification";
import { emptyShader } from "./empty-shader";

/**
 * @internal
 */
export const emptyGlProgramSpecification: IGlProgramSpec = new GlProgramSpecification(emptyShader, emptyShader);
