import { Environment } from "./src/environment.js";
import { type Loader } from "./src/loader.node.js";
export interface Options {
    includes?: string | Loader;
    autoDataVarname?: boolean;
    dataVarname?: string;
    autoescape?: boolean;
}
export default function (options?: Options): Environment;
//# sourceMappingURL=bare.d.ts.map