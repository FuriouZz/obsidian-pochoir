import { Environment } from "./src/environment.js";
import { FileLoader } from "./src/loader.node.js";
export default function (options = {}) {
    const loader = typeof options.includes === "object"
        ? options.includes
        : new FileLoader(options.includes);
    const env = new Environment({
        loader,
        dataVarname: options.dataVarname || "it",
        autoescape: options.autoescape ?? false,
        autoDataVarname: options.autoDataVarname ?? true,
    });
    return env;
}
