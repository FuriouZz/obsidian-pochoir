import type { Options } from "ventojs";
import autoTrim from "ventojs/plugins/auto_trim.js";
import echoTag from "ventojs/plugins/echo.js";
import _escape from "ventojs/plugins/escape.js";
import exportTag from "ventojs/plugins/export.js";
import forTag from "ventojs/plugins/for.js";
import functionTag from "ventojs/plugins/function.js";
import ifTag from "ventojs/plugins/if.js";
import importTag from "ventojs/plugins/import.js";
import includeTag from "ventojs/plugins/include.js";
import jsTag from "ventojs/plugins/js.js";
import layoutTag from "ventojs/plugins/layout.js";
import setTag from "ventojs/plugins/set.js";
import trim from "ventojs/plugins/trim.js";
import _unescape from "ventojs/plugins/unescape.js";
import { Environment, type Loader } from "ventojs/src/environment.js";

export function vento(options: Omit<Options, "includes"> & { loader: Loader }) {
    const env = new Environment({
        loader: options.loader,
        dataVarname: options.dataVarname || "it",
        autoescape: options.autoescape ?? false,
        autoDataVarname: options.autoDataVarname ?? true,
    });

    // Register basic plugins
    env.use(autoTrim());
    env.use(ifTag());
    env.use(forTag());
    env.use(jsTag());
    env.use(includeTag());
    env.use(setTag());
    env.use(layoutTag());
    env.use(functionTag());
    env.use(importTag());
    env.use(exportTag());
    env.use(echoTag());
    env.use(_escape());
    env.use(_unescape());
    env.use(trim());

    return env;
}
