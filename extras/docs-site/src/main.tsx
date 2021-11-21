import React from "react";
import ReactDOM from "react-dom";
import { Emscripten, getEmscriptenWrapper } from "rc-js-util";
import { ICartesian2dBindings } from "@visualization-tools/cartesian-2d";
import { onAppScriptsLoaded } from "./on-app-scripts-loaded";
import { IndexComponent } from "./index-component";

declare const require: (path: string) => Emscripten.EmscriptenModuleFactory<ICartesian2dBindings>;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const docsModule = require("docs-module");

window.addEventListener("load", async () =>
{
    // FIXME message on load error
    const wrapper = await getEmscriptenWrapper(new WebAssembly.Memory({ initial: 256, maximum: 8192 }), docsModule);
    const rootElement = onAppScriptsLoaded();

    ReactDOM.render(
        <React.StrictMode>
            <IndexComponent emscriptenModule={wrapper} rootElement={rootElement}/>
        </React.StrictMode>,
        rootElement,
    );
});
