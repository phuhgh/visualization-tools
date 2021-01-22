import { IErrorLocalization } from "./i-error-localization";

/**
 * @internal
 */
export const developerErrorLocalization: IErrorLocalization<string> = {
    getTx: (message: string) => message,
    glCompileError: "Failed to compile program, errors / warnings follow:",
};