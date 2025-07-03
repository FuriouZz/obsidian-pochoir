import "../_dnt.polyfills.js";
import type { Loader, TemplateSource } from "./environment.js";
export declare class UrlLoader implements Loader {
    #private;
    constructor(root: URL);
    load(file: string): Promise<TemplateSource>;
    resolve(from: string, file: string): string;
}
//# sourceMappingURL=url_loader.d.ts.map