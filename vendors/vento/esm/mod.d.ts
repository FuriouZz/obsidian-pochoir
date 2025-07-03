import "./_dnt.polyfills.js";
import { Options as BareOptions } from "./bare.js";
import { type Environment } from "./src/environment.js";
export interface Options extends BareOptions {
    /** @deprecated Use autoDataVarname */
    useWith?: boolean;
}
export default function (options?: Options): Environment;
//# sourceMappingURL=mod.d.ts.map