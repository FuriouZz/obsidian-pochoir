import "./_dnt.polyfills.js";
import create from "./bare.js";
import ifTag from "./plugins/if.js";
import forTag from "./plugins/for.js";
import includeTag from "./plugins/include.js";
import setTag from "./plugins/set.js";
import jsTag from "./plugins/js.js";
import layoutTag from "./plugins/layout.js";
import functionTag from "./plugins/function.js";
import importTag from "./plugins/import.js";
import exportTag from "./plugins/export.js";
import echoTag from "./plugins/echo.js";
import escape from "./plugins/escape.js";
import unescape from "./plugins/unescape.js";
import trim from "./plugins/trim.js";
export default function (options = {}) {
    const env = create({
        ...options,
        autoDataVarname: options.autoDataVarname ?? options.useWith ?? true,
    });
    // Register basic plugins
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
    env.use(escape());
    env.use(unescape());
    env.use(trim());
    return env;
}
