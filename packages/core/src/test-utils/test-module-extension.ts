/**
 * @internal
 **/
export const testModuleExtension = {
    locateFile: (fileName: string): string =>
    {
        return `base/build/${fileName}`;
    },
};