import "../_dnt.polyfills.js";
import type { Token } from "../src/tokenizer.js";
import type { Plugin } from "../src/environment.js";
export declare const defaultTags: string[];
export type AutoTrimOptions = {
    tags: string[];
};
export default function (options?: AutoTrimOptions): Plugin;
export declare function autoTrim(tokens: Token[], options: AutoTrimOptions): void;
//# sourceMappingURL=auto_trim.d.ts.map