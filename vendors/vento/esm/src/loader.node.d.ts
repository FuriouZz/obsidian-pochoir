import "../_dnt.polyfills.js";
import type { Loader, TemplateSource } from "./environment.js";
export type { Loader, TemplateSource };
export declare class FileLoader implements Loader {
    #private;
    constructor(root?: string);
    load(file: string): Promise<TemplateSource>;
    resolve(from: string, file: string): string;
}
//# sourceMappingURL=loader.node.d.ts.map