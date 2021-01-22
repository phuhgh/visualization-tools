import { TGetStringFromLocalization } from "rc-js-util";

/**
 * @public
 */
export interface IErrorLocalization<TLocalization>
{
    glCompileError: TLocalization;
    getTx: TGetStringFromLocalization<TLocalization>;
}